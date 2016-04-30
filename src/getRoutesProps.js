export default function getRoutesProps(routes) {
  return routes.reduce((previous, route) => {
    const standard = {
      ...previous,
      ...route,
    };

    return route.indexRoute ? { ...standard, ...route.indexRoute } : standard;
  });
}
