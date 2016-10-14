import expect from 'expect';

import getRoutePath from '../../src/util/getRoutePath';

describe('getRoutePath', () => {
  const routes = [
    {
      path: '/',
      component: function App() {},
    },
    {
      path: 'dashboard',
      component: function Dashboard() {},
    },
    {
      path: 'widget/:widgetName',
      component: function Widget() {},
    },
  ];

  it('Throws an Error when the route cannot be found among the matched routes', () => {
    expect(() => getRoutePath({}, routes)).toThrow('`route` not found in `routes`');
  });

  it('Gives gives the path up to the matched route', () => {
    expect(getRoutePath(routes[0], routes)).toBe('/');
    expect(getRoutePath(routes[1], routes)).toBe('//dashboard');
    expect(getRoutePath(routes[2], routes)).toBe('//dashboard/widget/:widgetName');
  });
});
