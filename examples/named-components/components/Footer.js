import React, { Component } from 'react';

export default class Footer extends Component {
  state = {
    year: new Date().getFullYear(),
  };

  render() {
    return (
      <div>
        <span>Copyright © {this.state.year}</span>
        <span>Made with ❤ by people</span>
        <span>Additional stuff. You know. Because we can.</span>
      </div>
    );
  }
}
