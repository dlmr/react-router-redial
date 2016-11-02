const path = require('path');
const webpack = require('webpack');

module.exports = {

  devtool: 'source-map',

  entry: ['babel-polyfill', path.join(__dirname, 'client.js')],

  output: {
    path: path.join(__dirname, 'build'),
    filename: 'bundle.js',
    publicPath: 'http://localhost:3001/'
  },

  resolve: {
    alias: {
      'react-router-redial': path.join(__dirname, '..', '..', 'src', 'index.js')
    }
  },

  module: {
    loaders: [
      { test: /\.js$/, exclude: /node_modules/, loader: require.resolve('babel-loader') }
    ]
  },

};
