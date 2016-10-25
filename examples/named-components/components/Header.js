import React, { Component } from 'react';
import { Link } from 'react-router';
import { provideHooks } from 'redial';

@provideHooks({
  fetch: ({ setProps, getProps, force }) => new Promise((resolve) => {
    const { color } = getProps();
    if (!color || force) {
      setTimeout(() => {
        const getValue = () => Math.round(Math.random() * 255);
        setProps({ color: `rgb(${getValue()}, ${getValue()}, ${getValue()})` });
        resolve();
      }, 1000);
    } else {
      resolve();
    }
  }),
})
export default class Header extends Component {
  render() {
    return (
      <div>
        <h2 style={{ color: this.props.color }}>I am but a simple header, doing my thing.</h2>
        <Link to="/named/with-children">Checkout more stuff!</Link>
      </div>
    );
  }
}
