import koa from 'koa';
import nunjucks from 'nunjucks';

import render from './render/server';
import routes from './routes';

require('./devServer');

nunjucks.configure(__dirname);

const server = koa();
server.use(function *() {
  const result = yield render(this.url, routes);
  this.body = nunjucks.render('template.html', {
    ...result,
    redialProps: JSON.stringify(result.redialProps)
  });
});
server.listen(3000);
console.log('Server started on http://localhost:3000');
