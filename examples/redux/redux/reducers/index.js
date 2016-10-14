export function githubUsers(state = {}, action) {
  switch (action.type) {
    case 'USER_LOADED':
      return {
        ...state,
        [action.meta.id]: action.payload,
      };
    default:
      return state;
  }
}
