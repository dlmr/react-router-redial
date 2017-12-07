import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link, IndexLink } from 'react-router';

export default class App extends Component {
  static propTypes = {
    loading: PropTypes.bool,
    children: PropTypes.node.isRequired,
  };

  render() {
    const { loading } = this.props;
    let style;
    if (loading) {
      style = {
        opacity: 0.5,
        transition: 'opacity 250ms ease 300ms',
      };
    }

    return (
      <div style={style}>
        <h1>React Router Redial Example</h1>
        <button onClick={this.props.abort}>Abort</button>
        <ul>
          <li>
            <IndexLink to="/">Start</IndexLink>
          </li>
          <li>
            <Link to="/github">Github</Link>
          </li>
          <li>
            <Link to="/fetch">Fetch, with client error</Link>
          </li>
          <li>
            <Link to="/slow_5">Slow, takes 5 seconds to complete</Link>
          </li>
          <li>
            <Link to="/slow_3">Slow, takes 3 seconds to complete</Link>
          </li>
          <li>
            <Link to="/defer">Defer, with client error</Link>
          </li>
        </ul>
        {this.props.children}
      </div>
    );
  }
}
