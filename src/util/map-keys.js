import findRouteByComponent from './find-route-by-component';
import getRoutePath from './get-route-path';

export default function createGenerateMapKeyByMatchedRoutes(routes) {
  return (component) => {
    const route = findRouteByComponent(component, routes);
    return getRoutePath(route, routes);
  };
}
