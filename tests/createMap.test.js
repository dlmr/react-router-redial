import expect from 'expect';

import createMap from '../src/createMap';

describe('createMap', () => {
  let map;

  beforeEach(() => {
    map = createMap();
  });

  describe('constructor', () => {
    it('should create Initialized map from constructor', () => {
      const keys = ['a', 'b', 'c', 'd'];
      const values = [4, undefined, 2, 1];
      const newMap = createMap(keys, values);
      expect(newMap.get('a')).toEqual(4);
      expect(newMap.get('b')).toEqual(undefined);
      expect(newMap.get('c')).toEqual(2);
      expect(newMap.get('d')).toEqual(1);
    });
  });

  describe('size', () => {
    it('should correctly report the size of the map', () => {
      expect(map.size()).toBe(0);
      map.set('a', {});
      expect(map.size()).toBe(1);
    });
  });

  describe('get', () => {
    it('should return undefined for empty key', () => {
      expect(map.get('a')).toEqual(undefined);
    });

    it('should return overwrite previous value for the same key', () => {
      map.set('a', { a: 1, b: 2 });
      map.set('a', { a: 0, c: 3 });
      expect(map.get('a')).toEqual({ a: 0, c: 3 });
    });
  });

  describe('dehydrate', () => {
    it('should return array of values in the same orders as the keys', () => {
      map.set('a', 1);
      map.set('b', 2);
      map.set('c', undefined);
      map.set('d', 4);
      expect(map.dehydrate(['d', 'c', 'b', 'a'])).toEqual([4, undefined, 2, 1]);
    });
  });

  describe('rehydrate', () => {
    it('should correctly rehydrate the map', () => {
      const keys = ['a', 'b', 'c', 'd'];
      const values = [4, undefined, 2, 1];
      map.rehydrate(keys, values);
      expect(map.get('a')).toEqual(4);
      expect(map.get('b')).toEqual(undefined);
      expect(map.get('c')).toEqual(2);
      expect(map.get('d')).toEqual(1);
    });
  });
});
