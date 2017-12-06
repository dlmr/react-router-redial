/* global __REDIAL_PROPS__ */

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import triggerHooks from './triggerHooks';
import createMap from './createMap';
import createMapKeys from './util/mapKeys';
import getAllComponents from './getAllComponents';

function hydrate(renderProps) {
  if (typeof __REDIAL_PROPS__ !== 'undefined' && Array.isArray(__REDIAL_PROPS__)) {
    const getMapKeyForComponent = createMapKeys(renderProps.routes, renderProps.components);
    const components = getAllComponents(renderProps.components);
    const componentKeys = components.map(getMapKeyForComponent);
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

    onError(err, { beforeTransition, location }) {
      if (process.env.NODE_ENV !== 'production') {
        const type = beforeTransition ? 'beforeTransition' : 'afterTransition';
        console.error(type, err, location);
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
    this.completed = {
      beforeTransition: false,
      afterTransition: false,
      error: null,
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
    const location = renderProps.location;
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

    this.completed.beforeTransition = false;

    this.setState({
      aborted,
      abort,
      loading: true,
      prevRenderProps: this.state.loading || this.state.aborted()
        ? this.state.prevRenderProps
        : this.props.renderProps,
    });

    this.runBeforeTransition(
      this.props.beforeTransition,
      components,
      renderProps,
      force,
      bail
    )
    .catch((error) => {
      let afterTransition = false;
      if (error && error.afterTransition !== undefined) {
        afterTransition = error.afterTransition;
        error = error.error; // eslint-disable-line
      }

      this.props.onError(error, {
        location,
        reason: bail() || 'other',
        // If not defined before it's a beforeTransition error
        beforeTransition: !afterTransition,
        router: this.props.renderProps.router,
        abort: () => this.abort(true, abort),
      });
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
        if (this.completed.afterTransition) {
          this.completed.afterTransition = false;
          this.props.onCompleted('afterTransition');
        }
      })
      .catch((err) => {
        // We will only propagate this error if beforeTransition have been completed
        // This because the beforeTransition error is more critical
        const error = () => this.props.onError(err, {
          location,
          reason: bail() || 'other',
          beforeTransition: false,
          router: this.props.renderProps.router,
          abort: () => this.abort(true, abort),
        });

        if (this.completed.beforeTransition) {
          error();
        } else {
          this.completed.error = error;
        }
      });
    }
  }

  runAfterTransition(hooks, components, renderProps, force = false, bail) {
    // Get afterTransition data, will not block route transitions
    this.completed.afterTransition = false;
    this.completed.error = null;

    this.setState({
      afterTransitionLoading: true,
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
      this.completed.afterTransition = true;
      this.setState({
        afterTransitionLoading: false,
        redialMap,
      });
    });
  }

  runBeforeTransition(hooks, components, renderProps, force = false, bail) {
    const completeRouteTransition = (redialMap) => {
      if (!bail() && !this.unmounted) {
        this.setState({
          loading: false,
          redialMap,
          prevRenderProps: undefined,
          initial: false,
        });

        this.props.onCompleted('beforeTransition');

        this.completed.beforeTransition = true;

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
          .catch((error) => Promise.reject({ error, afterTransition: true }));
        } else if (this.completed.afterTransition) {
          this.completed.afterTransition = false;
          this.props.onCompleted('afterTransition');
        } else if (this.completed.error) {
          this.completed.error();
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
