import React from 'react';
import { Router, Route, IndexRoute } from 'react-router'

import App from './components/App';
import Index from './components/Index';
import Github from './components/Github';
import User from './components/User';
import Fetch from './components/Fetch';
import Slow from './components/Slow';
import Defer from './components/Defer';

export default (
  <Route path="/" component={App}>
    <IndexRoute component={Index}/>
    <Route path="github" component={Github}>
       <Route path="user/:id" component={User} />
    </Route>
    <Route path="fetch" component={Fetch} />
    <Route path="slow_5" component={Slow} seconds="5" />
    <Route path="slow_3" component={Slow} seconds="3" />
    <Route path="defer" component={Defer} />
  </Route>
)
