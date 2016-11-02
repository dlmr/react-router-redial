import isPlainObject from 'lodash.isplainobject';

const isNamedComponents = isPlainObject;

function searchNamedComponents(component, namedComponents, correspondingRoute, result) {
  return Object.keys(namedComponents)
    .some(name => {
      const isMatch = namedComponents[name] === component;
      if (isMatch) {
        /* eslint-disable no-param-reassign */
        result.name = name;
        result.route = correspondingRoute;
        /* eslint-enable no-param-reassign */
      }
      return isMatch;
    });
}

export default function findRouteByComponent(component, matchedRoutes, matchedComponents) {
  const result = {};

  matchedComponents.some((matchedComponent, i) => {
    if (isNamedComponents(matchedComponent)) {
      return searchNamedComponents(component, matchedComponent, matchedRoutes[i], result);
    }

    const isMatch = component === matchedComponent;
    if (isMatch) {
      result.route = matchedRoutes[i];
    }
    return isMatch;
  });

  return result;
}
