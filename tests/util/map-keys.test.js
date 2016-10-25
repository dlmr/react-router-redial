import expect from 'expect';

import createGenerateMapKeyByMatchedRoutes from '../../src/util/mapKeys';

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
  const namedRoutes = [
    {
      path: '/',
      component: function App() {},
    },
    {
      component: function NamedContainer() {},
    },
    {
      path: 'named',
      components: {
        header: function Header() {},
        main: function Main() {},
      },
    },
  ];

  describe('regular routes', () => {
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

  describe('named routes', () => {
    const mapKeyByComponent = createGenerateMapKeyByMatchedRoutes(namedRoutes);
    it('Gives gives the path up to the matched route', () => {
      expect(mapKeyByComponent(namedRoutes[0].component, namedRoutes)).toBe('/');
      expect(mapKeyByComponent(namedRoutes[1].component, namedRoutes)).toBe('//');
      expect(
        mapKeyByComponent(namedRoutes[2].components.header, namedRoutes)
      ).toBe('///named@header');
    });
  });
});
