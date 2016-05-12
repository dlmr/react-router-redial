export default function getRoutesProps(routes) {
  return routes.reduce((previous, route) => {
    // eslint-disable-next-line no-unused-vars
    const { childRoutes, indexRoute, ...rest } = route;

    return {
      ...previous,
      ...rest,
    };
  }, {});
}
