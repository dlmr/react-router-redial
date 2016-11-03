# react-router-redial [![Travis][build-badge]][build] [![npm package][npm-badge]][npm] [![Coveralls][coverage-badge]][coverage]

Simple integration of [redial](https://github.com/markdalgleish/redial) for [React Router](https://github.com/reactjs/react-router)

```bash
$ npm install --save react-router-redial redial
```

## Why?
Data fetching is an important part of applications and [redial](https://github.com/markdalgleish/redial) is a great way to manage this in React when using React Router. This project aims to provide a great way to use redial together with React Router with a simple but yet powerful API.

Additionally it offers an alternative way to manage data for components without the need of flux. This means that you can start creating an application without for instance Redux and when you see the need for it you can easily update your application gradually.

react-router-redial has been inspired by [AsyncProps](https://github.com/ryanflorence/async-props) and can be seen as an alternative to it.

Works with universal applications that run on the server and the client as well as client only applications.

Works with IE9 if a Promise polyfill is provided.

### Difference from redial
- Simple integration with React Router
- Managing client side data loading with route transition support
- Powerful API to control hooks on both client and server
- Alternative way to pass data to components without the need of Redux

### Difference from AsyncProps
- Uses redial hooks to manage data loading
- Possible to easily transition to Flux/Redux

## Lifecycle hooks
You use [`@provideHooks`](https://github.com/markdalgleish/redial#providing-lifecycle-hooks) as would normally when using redial. One difference is that react-router-redial will provide some default locals to the hooks.

```js
import { provideHooks } from 'redial';

import React, { Component } from 'react';
import { getSomething } from 'actions/things';

@provideHooks({
  fetch: ({ dispatch, params: { id } }) => dispatch(getSomething(id)),
  defer: ({ setProps, getProps, force }) => {
    const { data } = getProps();
    if(!data || force) {
      // Will be available as this.props.data on the component
      setProps({ data: 'My important data' })
    }
  }
})
class MyRouteHandler extends Component {
  render() {
    return <div>{ this.props.data }</div>;
  }
}
```

### Default locals provided to the hooks
```
setProps          Makes it possible to set things that should be available to the component as props, should be an object
getProps          Makes it possible to get things that has been defined for the component, can be used for bailout
force             If the provideHooks has been invoked using the reload function
params            Route params from React Router
location          Location object from React Router
routeProps        Custom defined properties that has been defined on the route components
isAborted         Function that returns if the hooks has been aborted, can be used to ignore the result
```

### Default props available to decorated components
```
loading                 Will be true when beforeTransition hooks are not yet completed
afterTransitionLoading  Will be true when afterTransition hooks are not yet completed
reload                  Function that can be invoked to re-trigger the hooks for the current component
abort                   Function that can be invoked to abort current running hooks
```
Additionally components will have access to properties that has been set using `setProps`.

## Client API
The custom redial router middleware `useRedial` makes it easy to add support for redial on the client side using the `render` property from `Router` in React Router. It provides the following properties as a way to configure how the data loading should behave.
```
locals                     Extra locals that should be provided to the hooks other than the default ones
beforeTransition           Hooks that should be completed before a route transition is completed
afterTransition            Hooks that are not needed before making a route transition
parallel                   If set to true the afterTransition hooks will run in parallel with the beforeTransition ones
initialLoading             Component should be shown on initial client load, useful if server rendering is not used
onStarted(force)           Invoked when a route transition has been detected and when redial hooks will be invoked
onError(error, metaData)   Invoked when an error happens, see below for more info
onAborted(becauseError)    Invoked if it was prematurely aborted through manual interaction or an error
onCompleted(type)          Invoked if everything was completed successfully, with type being either "beforeTransition" or "afterTransition"
```

### `onError(error, metaData)`
__`metaData`__  
```
abort()            Function that can be used to abort current loading    
beforeTransition   If the error originated from a beforeTransition hook or not
reason             The reason for the error, can be either a "location-changed", "aborted" or "other"
router             React Router instance https://github.com/ReactTraining/react-router/blob/master/docs/API.md#contextrouter
```

#### Example
We can use `onError` to add handling for errors in our application. The example below shows how we can make the client either reload the page or transition back to the previous page on an error.

```javascript
const forcePageReloadOnError = true;
const goBackOnError = false;

// Function that can be used as a setting for useRedial
function onError(err, { abort, beforeTransition, reason, router }) {
  if (process.env.NODE_ENV !== 'production') {
    console.error(reason, err);
  }

  // We only what to do this if it was a beforeTransition hook that failed
  if (beforeTransition) {
    if (forcePageReloadOnError && reason === 'other') {
      window.location.reload();
    } else if (goBackOnError && reason !== 'location-changed') {
      router.goBack();
    }
    // Abort current loading automatically
    abort();
  }
}
```

### Example
```js
import { useRedial } from 'react-router-redial';
import { applyRouterMiddleware } from 'react-router';

<Router
  history={ browserHistory }
  routes={ routes }
  render={ applyRouterMiddleware(
    useRedial({
        locals,
        beforeTransition: ['fetch'],
        afterTransition: ['defer', 'done'],
        parallel: true,
        initialLoading: () => <div>Loading…</div>,
    })
  )}
/>
```

## Server API
Instead of using [`trigger`](https://github.com/markdalgleish/redial#triggering-lifecycle-events) on the server side we will use a wrapper that provides additional functionally named `triggerHooks`. It takes an object as an argument that has the following properties that can be used to configure how the data loading should behave.
```
components        The components that should be scanned for hooks, will default to renderProps.components
renderProps       The renderProps argument that match from React Router has in the callback
hooks             The hooks that should run on the server
locals            Additional locals that should be provided over the default, useful for Redux integration for example
```

`triggerHooks` will return a Promise that will resolve when all the hooks has been completed. It will be resolved with an object that contains the following properties.
```
redialMap         This should be used together with RedialContext on the server side
redialProps       This is for passing the props that has been defined with setProps to the client, expected to be on window.__REDIAL_PROPS__
```

### Example
```js
import { triggerHooks } from 'react-router-redial';

const locals = {
  some: 'data',
  more: 'stuff'
};

triggerHooks({
  components,
  renderProps,
  hooks,
  locals
}).then(({ redialMap, redialProps }) => render(redialMap, redialProps));
```

## Hooks
react-router-redial provides a simple way to define in what order certain hooks should run and if they can run in parallel. The same syntax is used for both `hooks` when used on the server with `triggerHooks` and `beforeTransition` + `afterTransition` on the client with `RedialContext`. The hooks are expected to be an array the can contain either single hooks or arrays of hooks. Each individual element in the array will run in parallel and after it has been completed the next element will be managed. This means that you can run some hooks together and others after they have been completed. This is useful if you for instance want to run some hook that should have access to some data that other hooks before it should have defined.

### Example
Let's look at an example to understand this a bit better. Say that we have the following hooks defined on the server:
```js
{
  hooks: [ ['fetch', 'defer'], 'done' ]
}
```
This means that the `fetch` and `defer` hooks will run at the same time and after they have been completed the `done` hook will run and it will then have access to the potential data that they might have set using either `setProps` or with for example Redux.

## Example

### Client
```js
import { useRedial } from 'react-router-redial';

import React from 'react';
import { render } from 'react-dom';
import { Router, browserHistory, applyRouterMiddleware } from 'react-router';
import { Provider } from 'react-redux';

// Your app's routes:
import routes from '../shared/routes';

// Render the app client-side to a given container element:
export default (container, store) => {
  // Define extra locals to be provided to all lifecycle hooks:
  const locals = store ? {
    dispatch: store.dispatch,
    getState: store.getState,
  } : {};

  let component = (
    <Router
      history={browserHistory}
      routes={routes}
      render={ applyRouterMiddleware(
        useRedial({
          locals,
          beforeTransition: ['fetch'],
          afterTransition: ['defer', 'done'],
          parallel: true,
          initialLoading: () => <div>Loading…</div>,
        })
      )}
    />
  );

  if (store) {
    component = (
      <Provider store={store}>
        {component}
      </Provider>
    );
  }

  // Render app to container element:
  render(component, container);
};
```

### Server
```js
import { triggerHooks, useRedial } from 'react-router-redial';

import React from 'react';
import { renderToString } from 'react-dom/server';
import { createMemoryHistory, match, applyRouterMiddleware } from 'react-router';
import { Provider } from 'react-redux';

// Your app's routes:
import routes from '../shared/routes';

// Render the app server-side for a given path:
export default (path, store) => new Promise((resolve, reject) => {
  // Set up history for router:
  const history = createMemoryHistory(path);

  // Match routes based on history object:
  match({ routes, history }, (error, redirectLocation, renderProps) => {

    // Define extra locals to be provided to all lifecycle hooks:
    const locals = store ? {
      dispatch: store.dispatch,
      getState: store.getState
    } : {};

    // Wait for async data fetching to complete, then render:
    triggerHooks({
      renderProps,
      locals,
      hooks: [ 'fetch', 'done' ]
    }).then(({ redialMap, redialProps }) => {
      const state = store ? store.getState() : null;
      // Use `applyRouterMiddleware` to create the `<RouterContext/>`,
      // as well as the `<RedialContext/>` and `<RedialContextContainer/>`
      // around each matched route. Pass in the `redialMap` to the middleware
      // to ensure we have access to it while rendering, and
      // pass the renderProps provided from `match`
      const component = applyRouterMiddleware(useRedial({ redialMap }))(renderProps);
      const html = store ? renderToString(
        <Provider store={store}>
          { component }
        </Provider>
      ) : renderToString(component);

      // Important that the redialProps are sent to the client
      // by serializing it and setting it on window.__REDIAL_PROPS__
      resolve({ html, state, redialProps });
    })
    .catch(reject);
  });
});
```

## Contributors
- [Gustaf Dalemar](https://github.com/dlmr) - author
- [Patrik Åkerstrand](https://github.com/PAkerstrand) - Rewrote as a middleware

[build-badge]: https://img.shields.io/travis/dlmr/react-router-redial/master.svg?style=flat-square
[build]: https://travis-ci.org/dlmr/react-router-redial

[npm-badge]: https://img.shields.io/npm/v/react-router-redial.svg?style=flat-square
[npm]: https://www.npmjs.org/package/react-router-redial

[coverage-badge]: https://img.shields.io/coveralls/dlmr/react-router-redial/master.svg?style=flat-square
[coverage]: https://coveralls.io/github/dlmr/react-router-redial
