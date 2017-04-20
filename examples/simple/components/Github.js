import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';

class Github extends Component {

  static propTypes = {
    router: PropTypes.shape({
      push: PropTypes.func.isRequired,
    }),
    children: PropTypes.node,
  };

  constructor(props) {
    super(props);
    this.state = { value: '' };
  }

  onChange = (e) => {
    this.setState({ value: e.target.value });
  };

  render() {
    return (
      <div>
        <h2>Github</h2>
        <div>
          <p>Please select a user by typing and clicking the link</p>
          <input onChange={this.onChange} />
          {' '}
          <button
            type="button"
            onClick={() =>
              this.props.router.push({ pathname: `/github/user/${this.state.value}` })
            }
          >
            Open user!
          </button>
        </div>
        {this.props.children}
      </div>
    );
  }
}

export default withRouter(Github);
