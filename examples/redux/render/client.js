import { useRedial } from 'react-router-redial';

import React from 'react';
import { render } from 'react-dom';
import { Router, browserHistory, applyRouterMiddleware } from 'react-router';
import { Provider } from 'react-redux';

// Render the app client-side to a given container element:
export default (container, routes, store) => {
  // Define extra locals to be provided to all lifecycle hooks:
  const locals = store ? {
    dispatch: store.dispatch,
    getState: store.getState,
  } : {};

  let component = (
    <Router
      history={browserHistory}
      routes={routes}
      render={applyRouterMiddleware(useRedial({
        locals,
        blocking: ['fetch', 'blockingDone'],
        defer: ['defer', 'deferDone'],
        parallel: false,
        initialLoading: () => <div>Loading…</div>,
      }))}
    />
  );

  if (store) {
    component = (
      <Provider store={store}>
        {component}
      </Provider>
    );
  }

  // Render app to container element:
  render(component, container);
};
