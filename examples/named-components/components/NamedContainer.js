import React, { Component } from 'react';

export default class NamedContainer extends Component {
  render() {
    const { header, footer, main } = this.props;
    return (
      <div>
        <div>
          <h1>Header fragment</h1>
          {header}
        </div>
        <div>
          <h1>Main fragment</h1>
          {main}
        </div>
        <div>
          <h1>Footer fragment</h1>
          {footer}
        </div>
      </div>
    )
  }
}
