import expect, { createSpy } from 'expect';

import getLocals from '../src/getLocals';

describe('getLocals', () => {
  it('should call locals if it is a function with component', () => {
    const locals = createSpy()
      .andReturn(1);
    const component = {};

    expect(getLocals(component, locals)).toBe(1);
    expect(locals).toHaveBeenCalledWith(component);
  });

  it('should return locals if not a function', () => {
    const locals = {};
    const component = {};

    expect(getLocals(component, locals)).toBe(locals);
  });
});
