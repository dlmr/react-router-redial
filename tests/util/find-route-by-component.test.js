import expect from 'expect';

import findRouteByComponent from '../../src/util/find-route-by-component';

describe('findRouteByComponent', () => {
  const component = () => {};
  it('Returns undefined for empty routes', () => {
    expect(findRouteByComponent(component, [])).toBe(undefined);
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
    expect(findRouteByComponent(component, routes)).toBe(routes[1]);
  });
});
