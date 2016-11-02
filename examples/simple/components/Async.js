import React, { Component } from 'react';
import { provideHooks } from 'redial';

@provideHooks({
  fetch: ({ setProps, getProps }) => new Promise((resolve) => {
    const { color } = getProps();
    if(!color) {
      setTimeout(() => {
        const getValue = () => Math.round(Math.random() * 255);
        setProps({color: `rgb(${getValue()}, ${getValue()}, ${getValue()})`});
        resolve();
      }, 1000);
    } else {
      resolve();
    }
  })
})
export default class Async extends Component {
  render() {
    return (
      <div>
        <h1 style={{ color: this.props.color }}>Async</h1>
      </div>
    );
  }
}
