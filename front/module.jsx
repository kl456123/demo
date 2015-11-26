import React from 'react'
import { Router, Route, Link } from 'react-router'
import ReactDOM from 'react-dom'

import Main from 'components/main';
import Basic from 'components/basic';
import PostData from 'components/postData';
ReactDOM.render((
  <Router>
    <Route path="/" component={PostData} />
    <Route path="detail/basic" component={Basic} />
    <Route path="list/basic" component={Basic} />
  </Router>
), document.getElementById('REACT'));
