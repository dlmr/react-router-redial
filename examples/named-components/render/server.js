import { triggerHooks, useRedial } from '../../../lib/index';

import { renderToString } from 'react-dom/server';
import { createMemoryHistory, match, applyRouterMiddleware } from 'react-router';

// Render the app server-side for a given path:
export default (path, routes) => new Promise((resolve, reject) => {
  // Set up history for router:
  const history = createMemoryHistory(path);

  // Match routes based on history object:
  match({ routes, history }, (error, redirectLocation, renderProps) => {
    if (error || !renderProps) {
      return reject(error);
    }

    // Wait for async data fetching to complete, then render:
    return triggerHooks({
      renderProps,
      hooks: ['fetch', 'done'],
    }).then(({ redialMap, redialProps }) => {
      const html = renderToString(applyRouterMiddleware(useRedial({ redialMap }))(renderProps));
      resolve({ html, redialProps });
    })
    .catch(reject);
  });
});
