import React from 'react';

export default class RedialContextContainer extends React.Component {
  static propTypes = {
    Component: React.PropTypes.func.isRequired,
    routerProps: React.PropTypes.object.isRequired,
  };

  static contextTypes = {
    redialContext: React.PropTypes.object.isRequired,
  };

  render() {
    const { Component, routerProps, ...props } = this.props;
    const { loading, deferredLoading, reloadComponent, redialMap } = this.context.redialContext;
    const redialProps = redialMap.get(Component);
    const reload = () => reloadComponent(Component);
    return (
      <Component
        { ...props }
        { ...routerProps }
        { ...redialProps }
        loading={loading}
        deferredLoading={deferredLoading}
        reload={reload}
      />
    );
  }
}
