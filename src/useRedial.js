import React from 'react';

import RedialContext from './RedialContext';
import RedialContextContainer from './RedialContextContainer';

export default function useRedial(options) {
  return {
    renderRouterContext: (child, props) => (
      <RedialContext renderProps={props} {...options}>
        {child}
      </RedialContext>
    ),
    /* eslint-disable react/prop-types */
    renderRouteComponent: (child, props) => (
      <RedialContextContainer routerProps={props}>
        {child}
      </RedialContextContainer>
    ),
    /* eslint-enable react/prop-types */
  };
}
