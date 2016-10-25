import React from 'react';
import { Route, IndexRoute } from 'react-router';

import App from './components/App';
import Footer from './components/Footer';
import Head from './components/Header';
import Index from './components/Index';
import LoremIpsum from './components/LoremIpsum';
import Main from './components/Main';
import NamedContainer from './components/NamedContainer';

export default (
  <Route path="/" component={App}>
    <IndexRoute component={Index} />
    <Route component={NamedContainer}>
      <Route path="named" components={{ header: Head, footer: Footer, main: Main }}>
        <Route path="with-children" component={LoremIpsum} />
      </Route>
    </Route>
  </Route>
);
