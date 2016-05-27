import { trigger } from 'redial';
import isPlainObject from 'lodash.isplainobject';
import createMap from './createMap';
import getRoutesProps from './getRoutesProps';
import getLocals from './getLocals';

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
  const setProps = (component) =>
    (props) => {
      if (!isPlainObject(props)) {
        throw new Error('The input to setProps needs to be an object');
      }
      redialMap.set(component, {
        ...redialMap.get(component),
        ...props,
      });
    };

  // Get components for a specific component
  const getProps = (component) =>
    () => redialMap.get(component) || {};

  const completeLocals = (component) => ({
    location: renderProps.location,
    params: renderProps.params,
    routeProps: getRoutesProps(renderProps.routes),
    setProps: setProps(component),
    getProps: getProps(component),
    isAborted: bail,
    force,
    ...getLocals(component, locals),
  });

  const hookComponents = components || renderProps.components;

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
      redialProps: redialMap.dehydrate([].concat(hookComponents)),
    };
  });
}
