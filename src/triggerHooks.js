import { trigger } from 'redial';
import isPlainObject from 'lodash.isplainobject';
import createMap from './createMap';
import getRoutesProps from './getRoutesProps';
import getLocals from './getLocals';
import getAllComponents from './getAllComponents';
import createMapKeys from './util/mapKeys';

export default function triggerHooks({
  hooks,
  components,
  locals,
  renderProps,
  force = false,
  bail = () => false,
  redialMap = createMap(),
}) {
  // Set props for specific component
  const setProps = (key) =>
    (props) => {
      if (!isPlainObject(props)) {
        throw new Error('The input to setProps needs to be an object');
      }
      redialMap.set(key, {
        ...redialMap.get(key),
        ...props,
      });
    };

  // Get components for a specific component
  const getProps = (key) =>
    () => redialMap.get(key) || {};

  const getMapKeyForComponent = createMapKeys(renderProps.routes, renderProps.components);

  const completeLocals = (component) => {
    const key = getMapKeyForComponent(component);
    return ({
      location: renderProps.location,
      params: renderProps.params,
      routeProps: getRoutesProps(renderProps.routes),
      setProps: setProps(key),
      getProps: getProps(key),
      isAborted: bail,
      force,
      ...getLocals(component, locals),
    });
  };

  const hookComponents = getAllComponents(components || renderProps.components);

  return hooks.reduce((promise, parallelHooks) =>
    promise.then(() => {
      if (bail()) {
        throw new Error(`Redial was terminated because: ${bail()}`);
      }
      return Promise.all(
        [].concat(parallelHooks)
          .map((hook) => trigger(hook, hookComponents, completeLocals))
      );
    }), Promise.resolve()
  ).then(() => {
    if (bail()) {
      throw new Error(`Redial was terminated because: ${bail()}`);
    }

    return {
      redialMap,
      redialProps: redialMap.dehydrate(hookComponents.map(getMapKeyForComponent)),
    };
  });
}
