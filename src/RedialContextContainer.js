import React from 'react';
import getRoutePath from './util/getRoutePath';

export default class RedialContextContainer extends React.Component {
  static propTypes = {
    children: React.PropTypes.element.isRequired,
    routerProps: React.PropTypes.object.isRequired,
  };

  static contextTypes = {
    redialContext: React.PropTypes.object.isRequired,
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
