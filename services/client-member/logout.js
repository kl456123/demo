var app = require('../../app.js');
var ligle = require('../index.js').ligle;

var pChecker = require('../midware/permission-checker.js');

// 路由
var router = app.Router();
router
  .route('/logout')
  .get(pChecker.passIf('member','login'),function(req,res){
    req.session.group='member';
    req.session.status='logout';
    req.session.user = null;
    res.redirect('/');
  });

module.exports = router;

