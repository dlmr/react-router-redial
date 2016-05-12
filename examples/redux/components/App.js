import React, { Component } from 'react';
import { Link, IndexLink } from 'react-router';

export default class App extends Component {
  render() {
    const { loading } = this.props
    const style = {
      opacity: loading ? 0.5 : 1,
      transition: loading ? 'opacity 250ms ease 300ms' : 'false'
    }

    return (
      <div style={style}>
        <h1>React Router Redial Example</h1>
        <ul>
          <li>
            <IndexLink to="/">Start</IndexLink>
          </li>
          <li>
            <Link to ="/github">Github</Link>
          </li>
        </ul>
        {this.props.children}
      </div>
    );
  }
}
