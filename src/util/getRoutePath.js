export default function getRoutePath(route, routes, name) {
  const matchIndex = routes.indexOf(route);
  if (matchIndex < 0) {
    throw new Error('`route` not found in `routes`');
  }
  const routesUntil = routes.slice(0, matchIndex + 1);
  let routePath = routesUntil
    .reduce((acc, { path }) => acc.concat(path), [])
    .join('/');
  if (name) {
    routePath = `${routePath}@${name}`;
  }
  return routePath;
}
