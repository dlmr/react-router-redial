import React, { Component } from 'react';

class Main extends Component {
  render() {
    return (
      <div>
        It's so much fun to be Malcolm in the Middle!
        {this.props.children}
      </div>
    );
  }
}

export default Main;
