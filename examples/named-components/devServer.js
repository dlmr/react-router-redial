import koa from 'koa';
import webpack from 'webpack';
import koaWebpackDevMiddleware from 'koa-webpack-dev-middleware';

import webpackConfig from './webpack.config.js';

const devServer = koa();
const compiler = webpack(webpackConfig);

devServer.use(
    koaWebpackDevMiddleware(compiler, {
        publicPath: '/',
        noInfo: false,
        quiet: false
    })
);

const hotMiddleware = require('webpack-hot-middleware')(compiler);
devServer.use(function* (next) {
    yield hotMiddleware.bind(null, this.req, this.res);
    yield next;
});

devServer.listen(3001);

console.log('Dev server started on http://localhost:3001');
