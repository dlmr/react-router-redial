export default function getRoutePath(route, routes) {
  const matchIndex = routes.indexOf(route);
  if (matchIndex < 0) {
    throw new Error('`route` not found in `routes`');
  }
  const routesUntil = routes.slice(0, matchIndex + 1);
  return routesUntil
    .reduce((acc, { path }) => acc.concat(path), [])
    .join('/');
}
