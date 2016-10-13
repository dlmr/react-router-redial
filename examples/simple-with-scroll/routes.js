import React from 'react';
import { Route, IndexRoute } from 'react-router'

import App from './components/App';
import Index from './components/Index';
import LongPage from './components/LongPage';

export default (
  <Route path="/" component={App}>
    <IndexRoute component={Index}/>
    <Route path="long-one" component={LongPage} />
    <Route path="another-long" component={LongPage} />
  </Route>
);
