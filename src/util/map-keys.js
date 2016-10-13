import findRouteByComponent from './find-route-by-component';
import getRoutePath from './get-route-path';

export default function createGenerateMapKeyByMatchedRoutes(routes) {
  return (component) => {
    const route = findRouteByComponent(component, routes);
    if (!route) {
      throw new Error('`component` not found among the matched `routes`');
    }
    return getRoutePath(route, routes);
  };
}
