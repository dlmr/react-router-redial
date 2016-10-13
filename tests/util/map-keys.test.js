import expect from 'expect';

import createGenerateMapKeyByMatchedRoutes from '../../src/util/map-keys';

describe('mapKeys', () => {
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
  const mapKeyByComponent = createGenerateMapKeyByMatchedRoutes(routes);

  it('Throws an Error when the component cannot be found among the matched routes', () => {
    expect(() => mapKeyByComponent(() => {}, routes)).toThrow(
      '`component` not found among the matched `routes`'
    );
  });

  it('Gives gives the path up to the matched route', () => {
    expect(mapKeyByComponent(routes[0].component, routes)).toBe('/');
    expect(mapKeyByComponent(routes[1].component, routes)).toBe('//dashboard');
    expect(mapKeyByComponent(routes[2].component, routes)).toBe('//dashboard/widget/:widgetName');
  });
});
