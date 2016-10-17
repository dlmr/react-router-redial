/* global __REDIAL_PROPS__ */

import React, { Component, PropTypes } from 'react';

import triggerHooks from './triggerHooks';
import createMap from './createMap';
import createMapKeys from './util/mapKeys';

function hydrate(renderProps) {
  if (typeof __REDIAL_PROPS__ !== 'undefined' && Array.isArray(__REDIAL_PROPS__)) {
    const getMapKeyForComponent = createMapKeys(renderProps.routes);
    const componentKeys = renderProps.components.map(getMapKeyForComponent);
    return createMap(componentKeys, __REDIAL_PROPS__);
  }

  return createMap();
}

export default class RedialContext extends Component {
  static displayName = 'RedialContext';

  static propTypes = {
    children: PropTypes.node.isRequired,

    // RouterContext default
    renderProps: PropTypes.object.isRequired,

    // Custom
    locals: PropTypes.object,
    blocking: PropTypes.array,
    defer: PropTypes.array,
    parallel: PropTypes.bool,
    initialLoading: PropTypes.func,
    onError: PropTypes.func,
    onAborted: PropTypes.func,
    onStarted: PropTypes.func,
    onCompleted: PropTypes.func,

    // Server
    redialMap: PropTypes.object,
  };

  static defaultProps = {
    blocking: [],
    defer: [],
    parallel: false,

    onError(err, { type }) {
      if (process.env.NODE_ENV !== 'production') {
        console.error(type, err);
      }
    },

    onAborted(becauseError) {
      if (process.env.NODE_ENV !== 'production') {
        if (becauseError) {
          console.warn('Loading was aborted from an error');
        } else {
          console.warn('Loading was aborted manually');
        }
      }
    },

    onStarted(force) {
      if (process.env.NODE_ENV !== 'production') {
        console.info('Loading started. Force:', force);
      }
    },

    onCompleted(type) {
      if (process.env.NODE_ENV !== 'production') {
        console.info('Loading completed. Type:', type);
      }
    },
  };

  static childContextTypes = {
    redialContext: PropTypes.object,
  };

  constructor(props, context) {
    super(props, context);
    this.state = {
      loading: false,
      deferredLoading: false,
      aborted: () => false,
      abort: () => {},
      prevRenderProps: undefined,
      redialMap: props.redialMap || hydrate(props.renderProps),
      initial: props.blocking.length > 0,
    };
  }

  getChildContext() {
    const { loading, deferredLoading, redialMap } = this.state;
    return {
      redialContext: {
        loading,
        deferredLoading,
        redialMap,
        reloadComponent: (component) => {
          this.reloadComponent(component);
        },
        abortLoading: () => {
          this.abort();
        },
      },
    };
  }

  componentDidMount() {
    this.load(this.props.renderProps.components, this.props.renderProps);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.renderProps.location === this.props.renderProps.location) {
      return;
    }

    this.load(nextProps.renderProps.components, nextProps.renderProps);
  }

  componentWillUnmount() {
    this.unmounted = true;
  }

  reloadComponent(component) {
    this.load(component, this.props.renderProps, true);
  }

  abort(becauseError) {
    // We need to be in a loading state for it to make sense
    // to abort something
    if (this.state.loading || this.state.deferredLoading) {
      this.state.abort();

      this.setState({
        loading: false,
        deferredLoading: false,
      });

      if (this.props.onAborted) {
        this.props.onAborted(becauseError);
      }
    }
  }

  load(components, renderProps, force = false) {
    let isAborted = false;
    const abort = () => {
      isAborted = true;
    };
    const aborted = () => isAborted;

    const bail = () => {
      const currentLocation = this.props.renderProps.location;
      if (aborted()) {
        return 'aborted';
      } else if (currentLocation !== renderProps.location) {
        return 'location-changed';
      }

      return false;
    };

    if (this.props.onStarted) {
      this.props.onStarted(force);
    }

    this.setState({
      aborted,
      abort,
      loading: true,
      blockingCompleted: false,
      prevRenderProps: this.state.aborted() ? this.state.prevRenderProps : this.props.renderProps,
    });

    if (this.props.parallel) {
      this.runDeferred(
        this.props.defer,
        components,
        renderProps,
        force,
        bail
      )
      .then(() => {
        if (this.state.blockingCompleted) {
          this.props.onCompleted('deferred');
        }
      })
      .catch((err) => {
        this.props.onError(err, {
          reason: bail() || 'other',
          blocking: false,
          router: this.props.renderProps.router,
          abort: () => this.abort(true),
        });
      });
    }

    this.runBlocking(
      this.props.blocking,
      components,
      renderProps,
      force,
      bail
    )
    .catch((error) => {
      this.props.onError(error, {
        reason: bail() || 'other',
        blocking: error.deferred === undefined, // If not defined before it's a blocking error
        router: this.props.renderProps.router,
        abort: () => this.abort(true),
      });
    });
  }

  runDeferred(hooks, components, renderProps, force = false, bail) {
    // Get deferred data, will not block route transitions
    this.setState({
      deferredLoading: true,
      deferredCompleted: false,
    });

    return triggerHooks({
      hooks,
      components,
      renderProps,
      redialMap: this.state.redialMap,
      locals: this.props.locals,
      force,
      bail,
    }).then(({ redialMap }) => {
      this.setState({
        deferredLoading: false,
        redialMap,
        deferredCompleted: true,
      });
    });
  }

  runBlocking(hooks, components, renderProps, force = false, bail) {
    const completeRouteTransition = (redialMap) => {
      if (!bail() && !this.unmounted) {
        this.setState({
          loading: false,
          blockingCompleted: true,
          redialMap,
          prevRenderProps: undefined,
          initial: false,
        });

        this.props.onCompleted('blocking');

        // Start deferred if we are not in parallel
        if (!this.props.parallel) {
          return this.runDeferred(
            this.props.defer,
            components,
            renderProps,
            force,
            bail
          )
          .then(() => {
            this.props.onCompleted('deferred');
          })
          .catch((error) => {
            error.deferred = true; // eslint-disable-line
            return Promise.reject(error);
          });
        } else if (this.state.deferredCompleted) {
          this.props.onCompleted('deferred');
        }
      }

      return Promise.resolve();
    };

    return triggerHooks({
      hooks,
      components,
      renderProps,
      redialMap: this.state.redialMap,
      locals: this.props.locals,
      force,
      bail,
    }).then(({ redialMap }) =>
      completeRouteTransition(redialMap)
    );
  }

  render() {
    if (this.props.initialLoading && this.state.initial && this.state.redialMap.size() === 0) {
      return this.props.initialLoading();
    }

    const props = (this.state.loading || this.state.aborted()) && this.state.prevRenderProps;
    if (props) {
      /* eslint-disable no-unused-vars */
      // Omit `createElement`. Otherwise we might skip `renderRouteContext` in `applyMiddleware`.
      const { createElement, ...prevProps } = props;
      /* eslint-enable no-unused-vars */
      return React.cloneElement(
        this.props.children,
        prevProps,
      );
    }

    return this.props.children;
  }
}
