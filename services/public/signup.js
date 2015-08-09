
var ligle = require('../index.js').ligle;
var logger = ligle.util.logger('signup');
var moment = require('moment');//设置验证码过期时间
var ms = require('ms');
var config = require('../config.js');

var verifyCode = require('../midware/verify-code.js');
var checkCode = verifyCode.checkCode;

var fieldChecker = require('../midware/field-checker.js');
var checkCellForm = fieldChecker({
  cellphone:'cellphone',
  password:'password'
});
var checkEmailForm = fieldChecker({
  email:'email',
  password:'password',
  nickname:'name'
});
var checkToken = fieldChecker({
  token:'uuid'
});


var Model = require('../model/member.js');

// 路由
var router = ligle.base.routes.Router(Model);
router
  .route('/registSMS')
  .get(function(req,res){
    var rd = res.ligle.renderer;
    rd.render('regist');
  })
  .post(checkCellForm,function(req,res){
    var rd = res.ligle.renderer;
    var aMember = new Model(req.body);
    var token = aMember.codeSMS;
    delete aMember.codeSMS;
    delete aMember.code;
    aMember.signUpVerifyCell(token,function(err,obj){
      if(err){
        logger.info(err,err.message);
        rd.errorBack(err.message,req.xhr);
        return;
      }
      rd.successRender('regist_verified',obj,req.xhr);
      return;
    });
  });

// 邮箱注册，通过链接验证
router
  .route('/regist')
  .get(function(req,res){
    var rd = res.ligle.renderer;
    rd.render('regist');
  })
  .post(checkCode,checkEmailForm,function(req,res){
    var rd = res.ligle.renderer;
    var aMember = new Model(req.body);
    aMember.signUpEmail(function(err,obj){
      if(err){
        logger.info(err,err.message);
        rd.errorBack(err.message,req.xhr);
        return;
      }
      obj.sendEmailLink(Model.TYPE.signup,function(err,obj){
        if(err){
          logger.info(err,err.message);
          rd.errorBack(err.message,req.xhr);
          return;
        }
        rd.successRender('regist_success',obj,req.xhr);
      });
    });
  });

router
  .route(config.email.routes.verify+'/:token')
  .all(function(req,res,next){
    req.body.token = req.params.token;
    next();
  })
  .get(checkToken,function(req,res){
    var aMember = new Model();
    var rd = res.ligle.renderer;
    var token = req.body.token;
    var query = {uuid:token};

    aMember.queryCheck(query,token,Model.checkEmailLinkToken,function(err,obj){
      if(err){
        logger.debug(err);
        rd.errorRender('errorMsg',err.message,req.xhr);
        return;
      }
      obj.verifyEmailLink(function(err,obj){
        if(err){
          logger.info(err,err.message);
          rd.errorRender('errorMsg',err.message,req.xhr);
          return;
        }
        rd.successRender('regist_verified',obj,req.xhr);
      });
    });
  });

// 获取短信验证码
router
  .route('/getSignupSMS')
  .post(checkCode,function(req,res){
    var obj = new Model(req.body);
    obj.sendSMS(Model.TYPE.signup,function(err,obj){
      if(err){
        logger.info(err);
        res.status(403).json({error:err.message});
        return;
      }
      res.sendStatus(204);
    });
  });

module.exports = router;


