
var ligle = require('../index.js').ligle;
var logger = ligle.util.logger('signup');
var moment = require('moment');//设置验证码过期时间
var ms = require('ms');
var config = require('../config.js');

var fieldChecker = require('../midware/field-checker.js');
var checkCellForm = fieldChecker({
  cellphone:'cellphone',
  password:'password'
});
var checkEmailForm = fieldChecker({
  email:'email',
  password:'password'
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
    if(req.body.codeSMS!==req.session.codeSMS ||
      'regist'!==req.session.type){
      return rd.errorBack('短信验证码错误',req.xhr);
    }

    var aMember = new Model(req.body);
    aMember.get({cellphone:aMember.cellphone},function(err,data){
      if(err) return rd.errorBack(err,req.xhr);
      if(data) return rd.errorBack('该手机号已注册',req.xhr);
      aMember.signUp(function(err, obj){
        if(err) return rd.errorBack('注册失败'+err,req.xhr);
        return rd.successRender('regist_verified',obj,req.xhr);
      });
    })
  });

var verifyCode = require('../midware/verify-code.js');
var checkCode = verifyCode.checkCode;
var checkEmailForm = fieldChecker({
  email:'email',
  password:'password',
  nickname:'name'
});
var checkToken = fieldChecker({
  token:'uuid'
});

// 邮箱注册
router
  .route('/regist')
  .get(function(req,res){
    var rd = res.ligle.renderer;
    rd.render('regist');
  })
  .post(checkCode,checkEmailForm,function(req,res){
    var rd = res.ligle.renderer;
    var aMember = new Model(req.body);
    aMember.get({email:aMember.email},function(err,data){
      if(err) return rd.errorBack(err,req.xhr);
      if(data) return rd.errorBack('该邮箱已注册',req.xhr);
      aMember.signUpEmail(function(err, obj){
        if(err) return rd.errorBack('注册失败'+err,req.xhr);
        return rd.successRender('regist_success',obj,req.xhr);
      });
    })
  });

router
  .route(config.verify.routes+'/:token')
  .all(function(req,res,next){
    req.body.token = req.params.token;
    next();
  })
  .get(checkToken,function(req,res){
    var aMember = new Model();
    var rd = res.ligle.renderer;
    aMember.get({signupToken:req.body.token},function(err,obj){
      if(err) return rd.errorBack(err,req.xhr);
      obj.status = 'email-verfied';
      obj.save(function(err,obj){
        if(err) return rd.errorBack(err,req.xhr);
        return rd.successRender('regist_verified',obj,req.xhr);
      });
    });
  });


module.exports = router;


