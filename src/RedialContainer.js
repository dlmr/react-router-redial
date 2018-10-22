import React, { Component } from 'react';
import PropTypes from 'prop-types';
import getRoutePath from './util/getRoutePath';

export default class RedialContainer extends Component {
  static displayName = 'RedialContainer';

  static propTypes = {
    children: PropTypes.element.isRequired,
    routerProps: PropTypes.object.isRequired,
  };

  static contextTypes = {
    redialContext: PropTypes.object.isRequired,
  };

  reload = () => {
    this.context.redialContext.reloadComponent(this.props.routerProps.route.component);
  };

  render() {
    const { routerProps, ...props } = this.props;
    const {
      abortLoading,
      loading,
      afterTransitionLoading,
      redialMap,
    } = this.context.redialContext;
    const mapKey = getRoutePath(routerProps.route, routerProps.routes, routerProps.key);
    const redialProps = redialMap.get(mapKey);

    return React.cloneElement(
      this.props.children,
      {
        ...props,
        ...redialProps,
        ...routerProps,
        loading,
        afterTransitionLoading,
        reload: this.reload,
        abort: abortLoading,
      }
    );
  }
}
