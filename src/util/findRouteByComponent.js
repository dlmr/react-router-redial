export default function findRouteByComponent(component, routes) {
  let foundRoute;
  for (const route of routes) {
    if (route.component === component) {
      foundRoute = route;
      break;
    }
  }
  return foundRoute;
}
