export default function findRouteByComponent(component, routes) {
  const result = {};
  for (const route of routes) {
    if (route.component === component) {
      result.route = route;
      return result;
    }
    if (route.components) {
      const foundNamedComponent = Object.keys(route.components)
        .some(key => {
          const found = route.components[key] === component;
          if (found) {
            result.name = key;
          }
          return found;
        });
      if (foundNamedComponent) {
        result.route = route;
        return result;
      }
    }
  }
  return result;
}
