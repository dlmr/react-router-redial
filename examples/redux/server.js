import koa from 'koa';
import nunjucks from 'nunjucks';

import render from './render/server';
import routes from './routes';
import configureStore from './redux/configureStore';

require('./devServer');

nunjucks.configure(__dirname);

const server = koa();
server.use(function *() {
  const store = configureStore();
  const result = yield render(this.url, routes, store);
  this.body = nunjucks.render('template.html', {
    ...result,
    state: JSON.stringify(result.state),
    redialProps: JSON.stringify(result.redialProps)
  });
});

server.listen(3000);
console.log('Server started on http://localhost:3000');
