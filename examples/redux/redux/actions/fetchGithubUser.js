import fetch from 'isomorphic-fetch';

export default function fetchGithubUser(userId) {
    return (dispatch) => {
      return fetch(`https://api.github.com/users/${userId}`)
        .then((response) => response.json())
        .then((user) => dispatch({
          type: 'USER_LOADED',
          payload: user
        }))
    }
}
