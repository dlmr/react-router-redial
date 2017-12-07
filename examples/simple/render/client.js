import { useRedial } from 'react-router-redial';

import React from 'react';
import { render } from 'react-dom';
import { Router, browserHistory, applyRouterMiddleware } from 'react-router';

// Render the app client-side to a given container element:
export default (container, routes) => {
  const forcePageReloadOnError = true;
  const goBackOnError = false;

  // Function that can be used as a setting for useRedial
  function onError(err, { location, abort, beforeTransition, reason, router }) {
    if (process.env.NODE_ENV !== 'production') {
      console.error(reason, err, location);
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

  function onAborted(becauseError, { previousLocation, router }) {
    if (process.env.NODE_ENV !== 'production') {
      if (becauseError) {
        console.warn('Loading was aborted from an error');
      } else {
        console.warn('Loading was aborted manually');
      }
    }

    // If the loading was aborted manually we want to go back to the previous URL
    if (!becauseError) {
      router.replace(previousLocation);
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
        onAborted,
      }))}
    />
  );

  // Render app to container element:
  render(component, container);
};
