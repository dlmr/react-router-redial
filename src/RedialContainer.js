import React, { Component, PropTypes } from 'react';
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

  render() {
    const { routerProps, ...props } = this.props;
    const {
      abortLoading,
      loading,
      deferredLoading,
      reloadComponent,
      redialMap,
    } = this.context.redialContext;
    const redialProps = redialMap.get(getRoutePath(routerProps.route, routerProps.routes));
    const reload = () => reloadComponent(routerProps.route.component);
    const abort = () => abortLoading();

    return React.cloneElement(
      this.props.children,
      {
        ...props,
        ...redialProps,
        ...routerProps,
        loading,
        deferredLoading,
        reload,
        abort,
      }
    );
  }
}
