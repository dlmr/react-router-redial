export default function getLocals(component, locals) {
  return typeof extraLocals === 'function' ?
    locals(component) :
    locals;
}
