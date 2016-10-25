import { RedialContext } from 'react-router-redial';

import React from 'react';
import { render } from 'react-dom';
import { Router, browserHistory } from 'react-router';

// Render the app client-side to a given container element:
export default (container, routes) => {
  const component = (
    <Router
      history={browserHistory}
      routes={routes}
      render={(props) => (
        <RedialContext
          { ...props }
          blocking={['fetch']}
          defer={['defer', 'done']}
          parallel={false}
          initialLoading={() => <div>Loading…</div>}
        />
      )}
    />
  );

  // Render app to container element:
  render(component, container);
};
