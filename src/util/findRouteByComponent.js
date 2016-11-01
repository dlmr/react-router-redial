export default function findRouteByComponent(component, routes, components) {
  const result = {};
  components.some((matchedComponent, i) => {
    if (typeof matchedComponent === 'object') {
      Object.keys(matchedComponent)
        .some(key => {
          if (matchedComponent[key] === component) {
            result.name = key;
            matchedComponent = matchedComponent[key]; // eslint-disable-line no-param-reassign
            return true;
          }
          return false;
        });
    }
    if (component === matchedComponent) {
      result.route = routes[i];
      return true;
    }
    return false;
  });

  return result;
}
