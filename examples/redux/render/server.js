import { triggerHooks, RedialContext } from '../../../lib/index';

import React from 'react';
import { renderToString } from 'react-dom/server';
import { createMemoryHistory, match } from 'react-router';
import { Provider } from 'react-redux';

// Render the app server-side for a given path:
export default (path, routes, store) => new Promise((resolve, reject) => {
  // Set up history for router:
  const history = createMemoryHistory(path);

  // Match routes based on history object:
  match({ routes, history }, (error, redirectLocation, renderProps) => {

    // Define extra locals to be provided to all lifecycle hooks:
    const locals = store ? {
      dispatch: store.dispatch,
      getState: store.getState
    } : {};

    // Wait for async data fetching to complete, then render:
    triggerHooks({
      renderProps,
      locals,
      hooks: [ 'fetch', 'done' ]
    }).then(({ redialMap, redialProps }) => {
      const state = store ? store.getState() : null;
      const component = <RedialContext {...renderProps} redialMap={ redialMap } />;
      const html = store ? renderToString(
        <Provider store={store}>
          { component }
        </Provider>
      ) : renderToString(component);

      // Important that the redialProps are sent to the client
      // by serializing it and setting it on window.__REDIAL_PROPS__
      resolve({ html, state, redialProps });
    })
    .catch(reject);
  });
});
