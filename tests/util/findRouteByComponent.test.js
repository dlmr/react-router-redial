import expect from 'expect';

import findRouteByComponent from '../../src/util/findRouteByComponent';

describe('findRouteByComponent', () => {
  const component = () => {};
  it('Returns an empty object for empty routes', () => {
    expect(findRouteByComponent(component, [])).toEqual({});
  });
  it('Returns an empty object when the component cannot be found among the routes', () => {
    const routes = [
      {
        component: function notThisOne() {},
      },
      {
        component: function andNotThisOnceEither() {},
      },
    ];
    expect(findRouteByComponent(component, routes)).toEqual({});
  });
  it('Returns the first matched route', () => {
    const routes = [
      {
        component: function notThisOne() {},
      },
      {
        component,
      },
    ];
    expect(findRouteByComponent(component, routes)).toEqual({ route: routes[1] });
  });
  it('Handles `components` for named routes', () => {
    const routes = [
      {
        component: function ARouteHandler() {},
      },
      {
        components: {
          a: function AScreen() {},
          b: function BScreen() {},
          c: component,
          d: function DScreen() {},
        },
      },
    ];
    expect(findRouteByComponent(component, routes)).toEqual({ route: routes[1], name: 'c' });
  });
});
