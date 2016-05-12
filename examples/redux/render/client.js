import { RedialContext } from 'react-router-redial';

import React from 'react';
import { render } from 'react-dom';
import { Router, browserHistory } from 'react-router';
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
      render={(props) => (
        <RedialContext
          { ...props }
          locals={locals}
          blocking={['fetch']}
          defer={['defer', 'done']}
          parallel={false}
          initialLoading={() => <div>Loading…</div>}
        />
      )}
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
