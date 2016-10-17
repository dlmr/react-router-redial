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
    beforeTransition: PropTypes.array,
    afterTransition: PropTypes.array,
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
    beforeTransition: [],
    afterTransition: [],
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
      afterTransitionLoading: false,
      aborted: () => false,
      abort: () => {},
      prevRenderProps: undefined,
      redialMap: props.redialMap || hydrate(props.renderProps),
      initial: props.beforeTransition.length > 0,
    };
  }

  getChildContext() {
    const { loading, afterTransitionLoading, redialMap } = this.state;
    return {
      redialContext: {
        loading,
        afterTransitionLoading,
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

  abort(becauseError, abort) {
    // Make sure we only cancel if it is the correct ongoing request
    if (!abort || this.state.abort === abort) {
      // We need to be in a loading state for it to make sense
      // to abort something
      if (this.state.loading || this.state.afterTransitionLoading) {
        this.state.abort();

        this.setState({
          loading: false,
          afterTransitionLoading: false,
        });

        if (this.props.onAborted) {
          this.props.onAborted(becauseError);
        }
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
      beforeTransitionCompleted: false,
      prevRenderProps: this.state.aborted() ? this.state.prevRenderProps : this.props.renderProps,
    });

    if (this.props.parallel) {
      this.runAfterTransition(
        this.props.afterTransition,
        components,
        renderProps,
        force,
        bail
      )
      .then(() => {
        if (this.state.beforeTransitionCompleted) {
          this.props.onCompleted('afterTransition');
        }
      })
      .catch((err) => {
        // We will only propagate this error if beforeTransition have been completed
        // This because the beforeTransition error is more critical
        if (this.state.beforeTransitionCompleted) {
          this.props.onError(err, {
            reason: bail() || 'other',
            beforeTransition: false,
            router: this.props.renderProps.router,
            abort: () => this.abort(true, abort),
          });
        }
      });
    }

    this.runBeforeTransition(
      this.props.beforeTransition,
      components,
      renderProps,
      force,
      bail
    )
    .catch((error) => {
      this.props.onError(error, {
        reason: bail() || 'other',
        // If not defined before it's a beforeTransition error
        beforeTransition: error.afterTransition === undefined,
        router: this.props.renderProps.router,
        abort: () => this.abort(true, abort),
      });
    });
  }

  runAfterTransition(hooks, components, renderProps, force = false, bail) {
    // Get afterTransition data, will not block route transitions
    this.setState({
      afterTransitionLoading: true,
      afterTransitionCompleted: false,
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
        afterTransitionLoading: false,
        redialMap,
        afterTransitionCompleted: true,
      });
    });
  }

  runBeforeTransition(hooks, components, renderProps, force = false, bail) {
    const completeRouteTransition = (redialMap) => {
      if (!bail() && !this.unmounted) {
        this.setState({
          loading: false,
          beforeTransitionCompleted: true,
          redialMap,
          prevRenderProps: undefined,
          initial: false,
        });

        this.props.onCompleted('beforeTransition');

        // Start afterTransition if we are not in parallel
        if (!this.props.parallel) {
          return this.runAfterTransition(
            this.props.afterTransition,
            components,
            renderProps,
            force,
            bail
          )
          .then(() => {
            this.props.onCompleted('afterTransition');
          })
          .catch((error) => {
            error.afterTransition = true; // eslint-disable-line
            return Promise.reject(error);
          });
        } else if (this.state.afterTransitionCompleted) {
          this.props.onCompleted('afterTransition');
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
