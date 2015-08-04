
var ligle = require('../index.js').ligle;
var logger = ligle.util.logger('signup');
var moment = require('moment');//设置验证码过期时间
var ms = require('ms');

var fieldChecker = require('../midware/field-checker.js');
var checkCellForm = fieldChecker({
  cellphone:'cellphone',
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
        if(err) rd.errorBack('注册失败'+err,req.xhr);
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

// 邮箱注册
router
  .route('/regist')
  .get(function(req,res){
    var rd = res.ligle.renderer;
    rd.render('regist');
  })
  .post(checkCode,checkCellForm,function(req,res){
    var rd = res.ligle.renderer;
    var aMember = new Model(req.body);
    aMember.get({email:aMember.email},function(err,data){
      if(err) return rd.errorBack(err,req.xhr);
      if(data) return rd.errorBack('该邮箱已注册',req.xhr);
      aMember.signUpEmail(function(err, obj){
        if(err) rd.errorBack('注册失败'+err,req.xhr);
        return rd.successRender('regist_success',obj,req.xhr);
      });
    })
  });


module.exports = router;


