import React from 'react';

import RedialContext from './RedialContext';
import RedialContainer from './RedialContainer';

export default function useRedial(options) {
  return {
    renderRouterContext: (child, props) => (
      <RedialContext renderProps={props} {...options}>
        {child}
      </RedialContext>
    ),
    /* eslint-disable react/prop-types */
    renderRouteComponent: (child, props) => (
      <RedialContainer routerProps={props}>
        {child}
      </RedialContainer>
    ),
    /* eslint-enable react/prop-types */
  };
}
