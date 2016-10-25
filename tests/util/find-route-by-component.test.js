import expect from 'expect';

import findRouteByComponent from '../../src/util/findRouteByComponent';

describe('findRouteByComponent', () => {
  const component = () => {};
  it('Returns undefined for empty routes', () => {
    expect(findRouteByComponent(component, [])).toMatch({});
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
    expect(findRouteByComponent(component, routes)).toMatch({ route: routes[1] });
  });
});
