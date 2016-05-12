/* global __REDIAL_PROPS__ */

import React, { Component } from 'react';
import RouterContext from 'react-router/lib/RouterContext';

import triggerHooks from './triggerHooks';
import createMap from './createMap';
import RedialContextContainer from './RedialContextContainer';

function createElement(component, props) {
  return (
    <RedialContextContainer Component={component} routerProps={props} />
  );
}

function hydrate(props) {
  if (typeof __REDIAL_PROPS__ !== 'undefined' && Array.isArray(__REDIAL_PROPS__)) {
    return createMap(props.components, __REDIAL_PROPS__);
  }

  return createMap();
}

export default class RedialContext extends Component {
  static propTypes = {
    // RouterContext default
    components: React.PropTypes.array.isRequired,
    params: React.PropTypes.object.isRequired,
    location: React.PropTypes.object.isRequired,
    render: React.PropTypes.func,
    onError: React.PropTypes.func,

    // Custom
    locals: React.PropTypes.object,
    blocking: React.PropTypes.array,
    defer: React.PropTypes.array,
    parallel: React.PropTypes.bool,
    initialLoading: React.PropTypes.func,

    // Server
    redialMap: React.PropTypes.object,
  };

  static defaultProps = {
    blocking: [],
    defer: [],
    parallel: false,

    render(props) {
      return <RouterContext { ...props } createElement={createElement} />;
    },

    onError(err) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('There was an error when fetching data: ', err);
      }
    },
  };

  static childContextTypes = {
    redialContext: React.PropTypes.object,
  };

  constructor(props, context) {
    super(props, context);
    this.state = {
      loading: false,
      deferredLoading: false,
      prevProps: null,
      redialMap: this.props.redialMap || hydrate(this.props),
      initial: this.props.blocking.length > 0,
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

  load(components, props, force = false) {
    this.runBlocking(
      this.props.blocking,
      components,
      props,
      force
    );

    if (force || this.props.parallel) {
      this.runDeferred(
        this.props.defer,
        components,
        props,
        force
      );
    }
  }

  runDeferred(hooks, components, props, force = false) {
    // Get deferred data, will not block route transitions
    this.setState({
      deferredLoading: true,
    });

    triggerHooks({
      hooks,
      components,
      renderProps: props,
      redialMap: this.state.redialMap,
      locals: this.props.locals,
      force,
    }).then(({ redialMap }) => {
      this.setState({
        deferredLoading: false,
        redialMap,
      });
    }).catch(this.props.onError);
  }

  runBlocking(hooks, components, props, force = false) {
    const completeRouteTransition = (redialMap) => {
      const sameLocation = this.props.location === props.location;

      if (sameLocation && !this.unmounted) {
        this.setState({
          loading: false,
          redialMap,
          prevProps: null,
          initial: false,
        });

        // Start deferred if we are not in parallel
        if (!this.props.parallel) {
          this.runDeferred(
            this.props.defer,
            components,
            props
          );
        }
      }
    };

    this.setState({
      loading: true,
      prevProps: this.props,
    });

    triggerHooks({
      hooks,
      components,
      renderProps: props,
      redialMap: this.state.redialMap,
      locals: this.props.locals,
      force,
    }).then(({ redialMap }) => {
      completeRouteTransition(redialMap);
    }).catch((err) => {
      this.props.onError(err);
      completeRouteTransition(this.state.redialMap);
    });
  }

  render() {
    if (this.props.initialLoading && this.state.initial && this.state.redialMap.size() === 0) {
      return this.props.initialLoading();
    }

    const props = this.state.loading ? this.state.prevProps : this.props;
    return this.props.render(props);
  }
}
