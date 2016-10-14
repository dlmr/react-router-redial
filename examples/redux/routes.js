import React from 'react';
import { Route, IndexRoute } from 'react-router';

import App from './components/App';
import Index from './components/Index';
import Github from './components/Github';
import User from './components/User';

export default (
  <Route path="/" component={App}>
    <IndexRoute component={Index} />
    <Route path="github" component={Github}>
      <Route path="user/:id" component={User} />
    </Route>
  </Route>
);
