export function githubUsers(state = {}, action) {
  switch (action.type) {
    case 'USER_LOADED':
      return {
        ...state,
        [action.payload.login]: action.payload
      };
    default:
      return state;
  }
}
