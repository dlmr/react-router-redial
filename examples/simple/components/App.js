import React, { Component, PropTypes } from 'react';
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
        <ul>
          <li>
            <IndexLink to="/">Start</IndexLink>
          </li>
          <li>
            <Link to="/github">Github</Link>
          </li>
        </ul>
        {this.props.children}
      </div>
    );
  }
}
