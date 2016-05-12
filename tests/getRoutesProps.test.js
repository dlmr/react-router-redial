import expect from 'expect';
import React from 'react';
import { Route, IndexRoute, match } from 'react-router';

import getRoutesProps from '../src/getRoutesProps';

describe('getRoutesProps', () => {
  it('should return the parameters from a React Router route object', () => {
    const MockComponent = () => (
      <div></div>
    );
    const routes = (
      <Route path="/" component={MockComponent} myprop={'top'}>
        <IndexRoute component={MockComponent} myprop={'index'} />
        <Route path="user" component={MockComponent} myprop={'user'} otherprop={200} />
      </Route>
    );
    match({ routes, location: '/' }, (error, redirectLocation, renderProps) => {
      expect(getRoutesProps(renderProps.routes)).toEqual({
        component: MockComponent,
        path: '/',
        myprop: 'index',
      });
    });

    match({ routes, location: '/user' }, (error, redirectLocation, renderProps) => {
      expect(getRoutesProps(renderProps.routes)).toEqual({
        component: MockComponent,
        path: 'user',
        myprop: 'user',
        otherprop: 200,
      });
    });
  });
});
