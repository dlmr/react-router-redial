export default function getAllComponents(components) {
  const arr = Array.isArray(components) ? components : [components];
  const result = [];
  arr.forEach(component => {
    if (typeof component === 'object') {
      Object.keys(component).forEach(key => result.push(component[key]));
    } else {
      result.push(component);
    }
  });
  return result;
}
