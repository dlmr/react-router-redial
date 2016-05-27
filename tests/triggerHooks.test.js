import expect, { createSpy } from 'expect';
import React from 'react';
import { Route, IndexRoute, match } from 'react-router';
import { provideHooks } from 'redial';

import getRoutesProps from '../src/getRoutesProps';
import triggerHooks from '../src/triggerHooks';

describe('triggerHooks', () => {
  let renderProps;
  const fetchSpy = createSpy();
  const deferSpy = createSpy();
  const doneSpy = createSpy();

  beforeEach(() => {
    const MockComponent = () => <div></div>;
    const DecoratedMockComponent = provideHooks({
      fetch: fetchSpy,
      defer: deferSpy,
      done: doneSpy,
    })(() => <div></div>);
    const routes = (
      <Route path="/" component={MockComponent} myprop={'top'}>
        <IndexRoute component={DecoratedMockComponent} myprop={'index'} />
        <Route path="user" component={DecoratedMockComponent} myprop={'user'} otherprop={200} />
      </Route>
    );
    match({ routes, location: '/' }, (error, redirectLocation, reactRouterRenderProps) => {
      renderProps = reactRouterRenderProps;
    });
  });

  afterEach(() => {
    fetchSpy.reset();
    deferSpy.reset();
    doneSpy.reset();
  });

  it('should only call hooks listed', () => {
    const hooks = ['fetch'];
    return triggerHooks({
      hooks,
      renderProps,
    }).then(() => {
      expect(fetchSpy).toHaveBeenCalled();
      expect(deferSpy).toNotHaveBeenCalled();
      expect(doneSpy).toNotHaveBeenCalled();
    });
  });

  it('call hooks with the correct default locals', () => {
    const hooks = ['fetch'];
    return triggerHooks({
      hooks,
      renderProps,
    }).then(() => {
      const locals = fetchSpy.calls[0].arguments[0];
      expect(locals.location).toEqual(renderProps.location);
      expect(locals.params).toEqual(renderProps.params);
      expect(locals.setProps).toBeA('function');
      expect(locals.getProps).toBeA('function');
      expect(locals.force).toBe(false);
      expect(locals.routeProps).toEqual(getRoutesProps(renderProps.routes));
    });
  });

  it('call hooks with the additional locals', () => {
    const hooks = ['fetch'];
    const extraLocals = {
      a: 1,
      b: 2,
    };
    return triggerHooks({
      hooks,
      renderProps,
      locals: extraLocals,
    }).then(() => {
      const locals = fetchSpy.calls[0].arguments[0];
      expect(locals.a).toBe(1);
      expect(locals.b).toBe(2);
    });
  });

  it('should only call in the correct order', () => {
    fetchSpy.andCall(({ setProps }) => {
      setProps({ a: 1 });
    });
    deferSpy.andCall(({ setProps }) => new Promise((resolve) => {
      setTimeout(() => {
        setProps({ b: 2 });
        resolve();
      }, 10);
    }));
    doneSpy.andCall(({ getProps }) => {
      expect(getProps()).toEqual({ a: 1, b: 2 });
    });

    const hooks = [['fetch', 'defer'], 'done'];
    return triggerHooks({
      hooks,
      renderProps,
    }).then(() => {
      expect(fetchSpy).toHaveBeenCalled();
      expect(deferSpy).toHaveBeenCalled();
      expect(doneSpy).toHaveBeenCalled();
    });
  });

  it('should return empty object when using getProps for the first time', () => {
    fetchSpy.andCall(({ getProps }) => {
      expect(getProps()).toEqual({});
    });

    const hooks = ['fetch'];
    return triggerHooks({
      hooks,
      renderProps,
    });
  });

  it('should merge multiple calls to setProps for the same component', () => {
    fetchSpy.andCall(({ setProps }) => {
      setProps({ a: 1, b: 2 });
    });

    deferSpy.andCall(({ setProps, getProps }) => {
      setProps({ b: 3, c: 4 });
      expect(getProps()).toEqual({ a: 1, b: 3, c: 4 });
    });

    const hooks = ['fetch', 'defer'];
    return triggerHooks({
      hooks,
      renderProps,
    });
  });

  it('should resolve with an initialized RedialMap', () => {
    fetchSpy.andCall(({ setProps }) => {
      setProps({ a: 1, b: 2 });
    });

    deferSpy.andCall(({ setProps }) => {
      setProps({ b: 3, c: 4 });
    });

    const hooks = ['fetch', 'defer'];
    return triggerHooks({
      hooks,
      renderProps,
    }).then(({ redialMap, redialProps }) => {
      expect(redialMap.size()).toBe(1);
      expect(redialProps).toEqual([undefined, { a: 1, b: 3, c: 4 }]);
    });
  });

  it('should throw if setProps does not recive a plain object', () => {
    fetchSpy.andCall(({ setProps }) => {
      setProps(2);
    });
    const hooks = ['fetch'];
    return triggerHooks({
      hooks,
      renderProps,
    }).catch((err) => {
      expect(err).toBeA(Error);
    });
  });

  it('should break the chain if bail is defined and not false', () => {
    const hooks = ['fetch'];
    const bail = () => 'Was aborted for some reason';
    return triggerHooks({
      hooks,
      renderProps,
      bail,
    }).catch((err) => {
      expect(err).toEqual(new Error(bail()));
    });
  });

  it('should break reject the chain if it was aborted after all was completed', () => {
    let aborted = false;
    doneSpy.andCall(() => {
      aborted = true;
    });
    fetchSpy.andCall(() => {});
    const hooks = ['fetch', 'done'];
    const bail = () => aborted && 'Was aborted for some reason';
    return triggerHooks({
      hooks,
      renderProps,
      bail,
    }).catch((err) => {
      expect(fetchSpy.calls.length).toEqual(1);
      expect(doneSpy.calls.length).toEqual(1);
      expect(err).toEqual(new Error(bail()));
    });
  });
});
