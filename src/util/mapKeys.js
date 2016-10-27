import findRouteByComponent from './findRouteByComponent';
import getRoutePath from './getRoutePath';

export default function createGenerateMapKeyByMatchedRoutes(routes) {
  return (component) => {
    const { route, name } = findRouteByComponent(component, routes);
    if (!route) {
      throw new Error('`component` not found among the matched `routes`');
    }
    return getRoutePath(route, routes, name);
  };
}
