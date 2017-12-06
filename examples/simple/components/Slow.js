import React, { Component } from 'react';
import { provideHooks } from 'redial';

@provideHooks({
  fetch: ({ routeProps, setProps }) => new Promise((resolve) => {
    setTimeout(() => {
      const getValue = () => Math.round(Math.random() * 255);
      setProps({color: `rgb(${getValue()}, ${getValue()}, ${getValue()})`});
      resolve();
    }, routeProps.seconds * 1000);
  })
})
export default class Slow extends Component {
  render() {
    return (
      <div>
        <h1 style={{ color: this.props.color }}>Slow, takes { this.props.route.seconds } to complete</h1>
      </div>
    );
  }
}
