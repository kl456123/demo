import React from 'react'
import { Router, Route, Link } from 'react-router'
import ReactDOM from 'react-dom'

import Main from 'components/main';
import Basic from 'components/basic';

ReactDOM.render((
  <Router>
    <Route path="/" component={Main} />
    <Route path="detail/basic" component={Basic} />
    <Route path="list/basic" component={Basic} />
  </Router>
), document.getElementById('REACT'));
