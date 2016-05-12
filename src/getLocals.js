export default function getLocals(component, locals) {
  return typeof locals === 'function' ?
    locals(component) :
    locals;
}
