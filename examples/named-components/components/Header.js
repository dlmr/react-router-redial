import React, { Component } from 'react';
import { Link } from 'react-router';

export default class Header extends Component {
  render() {
    return (
      <div>
        <h2>I am but a simple header, doing my thing.</h2>
        <Link to="/named/with-children">Checkout more stuff!</Link>
      </div>
    );
  }
}
