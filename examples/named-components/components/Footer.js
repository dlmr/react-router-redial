import React, { Component } from 'react';
import { provideHooks } from 'redial';

class Footer extends Component {
  render() {
    return (
      <div>
        <span>Copyright © {this.props.year}</span>
        <span>Made with ❤ by people</span>
        <span>Additional stuff. You know. Because we can.</span>
      </div>
    );
  }
}

const enhance = provideHooks({
  fetch: ({ setProps, getProps, force }) => new Promise((resolve) => {
    const { year } = getProps();
    if (!year || force) {
      setTimeout(() => {
        setProps({
          year: new Date().getFullYear(),
        });
        resolve();
      }, 250);
    } else {
      resolve();
    }
  }),
});

export default enhance(Footer);
