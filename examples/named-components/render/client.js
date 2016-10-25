import { useRedial } from 'react-router-redial';

import React from 'react';
import { render } from 'react-dom';
import { Router, browserHistory, applyRouterMiddleware } from 'react-router';

// Render the app client-side to a given container element:
export default (container, routes) => {
  const forcePageReloadOnError = true;
  const goBackOnError = false;

  // Function that can be used as a setting for useRedial
  function onError(err, { abort, beforeTransition, reason, router }) {
    if (process.env.NODE_ENV !== 'production') {
      console.error(reason, err);
    }

    // We only what to do this if it was a blocking hook that failed
    if (beforeTransition) {
      if (forcePageReloadOnError && reason === 'other') {
          window.location.reload();
        } else if (goBackOnError && reason !== 'location-changed') {
          router.goBack();
        }
      // Abort current loading automatically
      abort();
    }
  }

  const component = (
    <Router
      history={browserHistory}
      routes={routes}
      render={applyRouterMiddleware(useRedial({
        beforeTransition: ['fetch'],
        afterTransition: ['defer', 'done'],
        parallel: true,
        initialLoading: () => <div>Loading…</div>,
        onError,
      }))}
    />
  );

  // Render app to container element:
  render(component, container);
};
