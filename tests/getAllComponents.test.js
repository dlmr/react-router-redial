import expect from 'expect';
import React from 'react';
import { Route, IndexRoute, match } from 'react-router';

import getAllComponents from '../src/getAllComponents';

describe('getAllComponents', () => {
  it('should return the correct length of route components', () => {
    const MockComponent = () => (
      <div></div>
    );
    const MockNamed1Component = () => (
      <div></div>
    );
    const MockNamed2Component = () => (
      <div></div>
    );

    const routes = (
      <Route path="/" component={MockComponent} myprop={'top'}>
        <IndexRoute component={MockComponent} myprop={'index'} />
        <Route
          path="user"
          components={{ name1: MockNamed1Component, named2: MockNamed2Component }}
        />
      </Route>
    );

    match({ routes, location: '/' }, (error, redirectLocation, renderProps) => {
      expect(getAllComponents(renderProps.components).length).toEqual(2);
    });

    match({ routes, location: '/user' }, (error, redirectLocation, renderProps) => {
      expect(getAllComponents(renderProps.components).length).toEqual(3);
    });
  });

  it('should manage a single component correctly', () => {
    const MockComponent = () => (
      <div></div>
    );
    expect(getAllComponents(MockComponent).length).toEqual(1);
  });
});
