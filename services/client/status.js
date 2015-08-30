var app = require('../../app.js');
var ligle = require('../index.js').ligle;
var logger = ligle.util.logger('status');

var pChecker = require('../midware/permission-checker.js');

// 路由
var router = app.Router();
router
  .route('/getIsLogin')
  .get(function(req,res){
    logger.debug(req.session.group,pChecker.isMember(req));
    logger.debug(req.session.status,pChecker.isLogin(req));
    if(pChecker.isMember(req) &&
      pChecker.isLogin(req)){
      res.status(200).send({isLogin:true});
    }else{
      res.status(200).send({isLogin:false});
    }
  });

module.exports = router;
