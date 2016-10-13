import React, { Component } from 'react';
import { provideHooks } from 'redial';
import { connect } from 'react-redux';

import fetchGithubUser from '../redux/actions/fetchGithubUser';

function mapStateToProps(state, ownProps) {
  return { user: state.githubUsers[ownProps.params.id.toLowerCase()] }
}

@provideHooks({
  fetch: ({ params: { id }, dispatch, getState }) => {
    if(!getState().githubUsers[id.toLowerCase()]) {
      return dispatch(fetchGithubUser(id));
    }
  }
})
@connect(mapStateToProps)
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
