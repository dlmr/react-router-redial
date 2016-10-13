import React, { Component, PropTypes } from 'react';
import { Link, IndexLink } from 'react-router';

export default class App extends Component {
  static propTypes = {
    loading: PropTypes.bool,
    children: PropTypes.node.isRequired,
  };

  render() {
    const { loading } = this.props;
    let style = {
      paddingTop: '2em',
    };
    if (loading) {
      style = {
        ...style,
        opacity: 0.5,
        transition: 'opacity 250ms ease 300ms',
      };
    }

    return (
      <div style={style}>
        <ul style={{ position: 'fixed', margin: 0, padding: '1em', top: 0, left: 0, right: 0, display: 'flex', justifyContent: 'space-around', background: 'white', borderBottom: '1px solid #a7a7a7' }}>
          <li>
            <IndexLink to="/">Start</IndexLink>
          </li>
          <li>
            <Link to="/long-one">Long page</Link>
          </li>
          <li>
            <Link to="/another-long">Another long page</Link>
          </li>
        </ul>
        <h1>React Router Redial Example</h1>
        {this.props.children}
      </div>
    );
  }
}
