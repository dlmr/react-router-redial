import { triggerHooks, RedialContext } from '../../../lib/index';

import React from 'react';
import { renderToString } from 'react-dom/server';
import { createMemoryHistory, match } from 'react-router';

// Render the app server-side for a given path:
export default (path, routes) => new Promise((resolve, reject) => {
  // Set up history for router:
  const history = createMemoryHistory(path);

  // Match routes based on history object:
  match({ routes, history }, (error, redirectLocation, renderProps) => {
    if (error || !renderProps) {
      return resolve({
          html: '',
          redialProps: null
      });
    }

    // Wait for async data fetching to complete, then render:
    triggerHooks({
      renderProps,
      hooks: [ 'fetch', 'done' ]
    }).then(({ redialMap, redialProps }) => {
      const html = renderToString(
        <RedialContext {...renderProps} redialMap={ redialMap } />
      );
      resolve({ html, redialProps });
    })
    .catch(reject);
  });
});
