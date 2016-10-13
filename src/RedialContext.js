/* global __REDIAL_PROPS__ */

import React, { Component, PropTypes } from 'react';

import triggerHooks from './triggerHooks';
import createMap from './createMap';
import createMapKeys from './util/map-keys';

function hydrate(props) {
  if (typeof __REDIAL_PROPS__ !== 'undefined' && Array.isArray(__REDIAL_PROPS__)) {
    const getMapKeyForComponent = createMapKeys(props.routes);
    const componentKeys = props.components.map(getMapKeyForComponent);
    return createMap(componentKeys, __REDIAL_PROPS__);
  }

  return createMap();
}

export default class RedialContext extends Component {
  static propTypes = {
    children: PropTypes.node.isRequired,

    // RouterContext default
    components: PropTypes.array.isRequired,
    params: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    render: PropTypes.func,
    onError: PropTypes.func,

    // Custom
    locals: PropTypes.object,
    blocking: PropTypes.array,
    defer: PropTypes.array,
    parallel: PropTypes.bool,
    initialLoading: PropTypes.func,
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

    onError(err, type) {
      if (process.env.NODE_ENV !== 'production') {
        console.error(type, err);
      }
    },

    onAborted() {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('Loading was aborted manually');
      }
    },

    onStarted(force) {
      if (process.env.NODE_ENV !== 'production') {
        console.info('Loading started. Force:', force);
      }
    },

    onCompleted() {
      if (process.env.NODE_ENV !== 'production') {
        console.info('Loading completed');
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
      prevProps: undefined,
      redialMap: props.redialMap || hydrate(props),
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
    this.load(this.props.components, this.props);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.location === this.props.location) {
      return;
    }

    this.load(nextProps.components, nextProps);
  }

  componentWillUnmount() {
    this.unmounted = true;
  }

  reloadComponent(component) {
    this.load(component, this.props, true);
  }

  abort() {
    // We need to be in a loading state for it to make sense
    // to abort something
    if (this.state.loading || this.state.deferredLoading) {
      this.state.abort();

      this.setState({
        loading: false,
        deferredLoading: false,
      });

      if (this.props.onAborted) {
        this.props.onAborted();
      }
    }
  }

  load(components, props, force = false) {
    let isAborted = false;
    const abort = () => {
      isAborted = true;
    };
    const aborted = () => isAborted;

    const bail = () => {
      if (aborted()) {
        return 'aborted';
      } else if (this.props.location !== props.location) {
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
      prevProps: this.state.aborted() ? this.state.prevProps : this.props,
    });

    const promises = [this.runBlocking(
      this.props.blocking,
      components,
      props,
      force,
      bail
    )];

    if (this.props.parallel) {
      promises.push(this.runDeferred(
        this.props.defer,
        components,
        props,
        force,
        bail
      ));
    }

    Promise.all(promises)
      .then(this.props.onCompleted)
      .catch((err) => this.props.onError(err, bail() || 'other'));
  }

  runDeferred(hooks, components, props, force = false, bail) {
    // Get deferred data, will not block route transitions
    this.setState({
      deferredLoading: true,
    });

    return triggerHooks({
      hooks,
      components,
      renderProps: props,
      redialMap: this.state.redialMap,
      locals: this.props.locals,
      force,
      bail,
    }).then(({ redialMap }) => {
      this.setState({
        deferredLoading: false,
        redialMap,
      });
    });
  }

  runBlocking(hooks, components, props, force = false, bail) {
    const completeRouteTransition = (redialMap) => {
      if (!bail() && !this.unmounted) {
        this.setState({
          loading: false,
          redialMap,
          prevProps: undefined,
          initial: false,
        });

        // Start deferred if we are not in parallel
        if (!this.props.parallel) {
          return this.runDeferred(
            this.props.defer,
            components,
            props,
            force,
            bail
          );
        }
      }

      return Promise.resolve();
    };

    return triggerHooks({
      hooks,
      components,
      renderProps: props,
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

    if (this.state.loading || this.state.aborted()) {
      /* eslint-disable no-unused-vars */
      // Omit `createElement`. Otherwise we might miss `renderRouteContext` in `applyMiddleware`.
      const { createElement, ...routerProps } = this.state.prevProps.routerProps;
      /* eslint-enable no-unused-vars */
      return React.cloneElement(
        this.props.children,
        routerProps,
      );
    }

    return this.props.children;
  }
}
