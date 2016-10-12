export default function createMap(possibleKeys, allValues) {
  const keys = [];
  const values = [];

  const set = (index, value) => {
    const i = keys.indexOf(index);
    if (i > -1) {
      values[i] = value;
    } else {
      keys.push(index);
      values.push(value);
    }
  };

  const size = () => keys.length;

  const get = (index) => values[keys.indexOf(index)];

  const dehydrate = (allPossibleKeys) => allPossibleKeys.map((key) => get(key));

  const rehydrate = (allPossibleKeys, state) => {
    state.forEach((value, index) => {
      if (value) {
        set(allPossibleKeys[index], value);
      }
    });
  };

  if (possibleKeys && allValues) {
    rehydrate(possibleKeys, allValues);
  }

  return {
    set,
    get,
    size,
    dehydrate,
    rehydrate,
    dump() {
      return {
        keys,
        values,
      };
    },
  };
}
