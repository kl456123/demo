import React from 'react'
import { Router, Route, Link } from 'react-router'

import Main from 'components/main';  
import Example from 'components/example';

React.render((
  <Router>
    <Route path="/" component={Main} />
    <Route path="example" component={Example} />
  </Router>
), document.getElementById('content'));
