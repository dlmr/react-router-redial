import { useRedial } from 'react-router-redial';
import { useScroll } from 'react-router-scroll';

import React from 'react';
import { render } from 'react-dom';
import { Router, browserHistory, applyRouterMiddleware } from 'react-router';

// Render the app client-side to a given container element:
export default (container, routes) => {
  const component = (
    <Router
      history={browserHistory}
      routes={routes}
      render={applyRouterMiddleware(
        useScroll(),
        useRedial({
          beforeTransition: ['fetch'],
          afterTransition: ['defer', 'done'],
          parallel: false,
          initialLoading: () => <div>Loading…</div>,
        })
      )}
    />
  );

  // Render app to container element:
  render(component, container);
};
