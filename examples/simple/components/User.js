import React, { Component } from 'react';
import { provideHooks } from 'redial';
import fetch from 'isomorphic-fetch';

@provideHooks({
  fetch: ({ params, setProps, getProps }) => {
    if (!getProps().user || getProps().user.login !== params.id) {
      return fetch(`https://api.github.com/users/${params.id}`)
        .then((response) => response.json())
        .then((user) => setProps({ user }))
    }
  }
})
export default class User extends Component {
  render() {
    return (
      <div>
        <h3>{ this.props.user.name } <pre>@{ this.props.user.login }</pre></h3>
        <img src={ this.props.user.avatar_url } />
      </div>
    );
  }
}
