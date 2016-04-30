# react-router-redial [![Travis][build-badge]][build] [![npm package][npm-badge]][npm]

Simple integration of [redial](https://github.com/markdalgleish/redial) for [React Router](https://github.com/reactjs/react-router)

```bash
$ npm install --save react-router-redial
```

## Why?
Data fetching is an important part of applications and [redial](https://github.com/markdalgleish/redial) is a great way to manage this in React when using React Router. This project aims to provide a great way to use redial together with React Router with a simple but yet powerful API.

Additionally it offers an alternative way to manage data for components without the need of flux. This means that you can start creating an application without for instance Redux and when you see the need for it you can easily update your application gradually.

react-router-redial has been inspired by [AsyncProps](https://github.com/ryanflorence/async-props) and can be seen as an alternative to it.

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
  defer: ({ setProps, getProps, force, params: { id } }) => {
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
```

### Default props available to decorated components
```
loading           Will be true when blocking hooks are not yet completed
deferredLoading   Will be true when deferred hooks are not yet completed
reload            Function that can be invoked to re-trigger the hooks for the current component
```
Additionally components will have access to properties that has been set using `setProps`.

## Client API
The custom router context `RedialContext` makes it easy to add support for redial on the client side using the `render` property from `Router` in React Router. It provides the following properties as a way to configure how the data loading should behave.
```
locals            Extra locals that should be provided to the hooks other than the default ones
blocking          Hooks that should be completed before a route transition is completed
defer             Hooks that are not needed before making a route transition
parallel          If set to true the deferred hooks will run in parallel with the blocking ones
initialLoading    Component should be shown on initial client load, useful if server rendering is not used
```

```js
import { RedialContext } from 'react-router-redial';

<Router
  history={ browserHistory }
  routes={ routes }
  render={ (props) => (
    <RedialContext
      { ...props }
      locals={ locals }
      blocking={ ['fetch'] }
      defer={ ['defer', 'done' ] }
      parallel={ true }
      initialLoading={ () => <div>Loading…</div> }
    />
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
react-router-redial provides a simple way to define in what order certain hooks should run and if they can run in parallel. The same syntax is used for both `hooks` when used on the server with `triggerHooks` and `blocking` + `defer` on the client with `RedialContext`. The hooks are expected to be an array the can contain either single hooks or arrays of hooks. Each individual element in the array will run in parallel and after it has been completed the next element will be managed. This means that you can run some hooks together and others after they have been completed. This is useful if you for instance want to run some hook that should have access to some data that other hooks before it should have defined.

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
import { RedialContext } from 'react-router-redial';

import React from 'react';
import { render } from 'react-dom';
import { Router, browserHistory } from 'react-router';

// Your app's routes:
import routes from './routes';

// Render the app client-side to a given container element:
export default (container, store) => {

  // Define extra locals to be provided to all lifecycle hooks:
  const locals = store ? {
      dispatch: store.dispatch,
      getState: store.getState
  } : {};

  let component = (
    <Router
      history={ browserHistory }
      routes={ routes }
      render={ (props) => (
        <RedialContext
          { ...props }
          locals={ locals }
          blocking={ ['fetch'] }
          defer={ ['defer', 'done' ] }
          parallel={ true }
          initialLoading={ () => <div>Loading…</div> }
        />
      )}
    />
  );

  if (store) {
    component = (
      <Provider store={store}>
        { component }
      </Provider>
    )
  }

  // Render app to container element:
  render(component, container);
};
```

### Server
```js
import { triggerHooks, RedialContext } from 'react-router-redial';

import React from 'react';
import { renderToString } from 'react-dom/server';
import { createMemoryHistory, match } from 'react-router';

// Your app's reducer and routes:
import reducer from './reducer';
import routes from './routes';

// Render the app server-side for a given path:
export default (path, store) => new Promise((resolve, reject) => {
  // Set up history for router:
  const history = createMemoryHistory(path);

  // Match routes based on history object:
  match({ routes, history }, (error, redirectLocation, renderProps) => {
    // Get array of route handler components:
    const { components } = renderProps;

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
        const state = store ? store.getState() : undefined;
        const html = renderToString(
          <Provider store={store}>
            <RedialContext {...renderProps} redialMap={ redialMap } />
          </Provider>
        );

        // Important that the redialProps are sent to the client-only
        // by serializing it and setting it on window.__REDIAL_PROPS__
        resolve({ html, state, redialProps });
      })
      .catch(reject);
  });
});
```

[build-badge]: https://img.shields.io/travis/dlmr/react-router-redial/master.svg?style=flat-square
[build]: https://travis-ci.org/dlmr/react-router-redial

[npm-badge]: https://img.shields.io/npm/v/react-router-redial.svg?style=flat-square
[npm]: https://www.npmjs.org/package/react-router-redial
