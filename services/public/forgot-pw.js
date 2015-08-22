
var ligle = require('../index.js').ligle;
var logger = ligle.util.logger('forgot-pw');
var config = require('../config.js');

var verifyCode = require('../midware/verify-code.js');
var checkCode = verifyCode.checkCode;

var fieldChecker = require('../midware/field-checker.js');
var checkCellForm = fieldChecker({
  cellphone:'cellphone',
  password:'password'
});
var checkEmailForm = fieldChecker({
  email:'email'
});
var checkPwdForm = fieldChecker({
  password:'password'
});
var checkToken = fieldChecker({
  token:'uuid'
});

// 路由
var Model = require('../model/member.js');
var router = ligle.base.routes.Router(Model);

// 手机找回密码
router
  .route(config.cell.routes.reset) 
  .get(function(req,res){
    var rd = res.ligle.renderer;
    var obj = res.ligle.model;
    rd.render('member/findPW');
  })
  .post(checkCellForm,function(req,res){
    var rd = res.ligle.renderer;
    var aMember = new Model(req.body);
    var token = {value:aMember.codeSMS,type:Model.TYPE.reset};
    delete aMember.codeSMS;
    delete aMember.code;

    aMember.resetVerifyCell(token,function(err,obj){
      rd.renderEO('member/findPW','member/changedPW',err,obj);
    });
  });

// 邮箱找回密码
router
  .route(config.email.routes.reset)
  .get(function(req,res){
    var rd = res.ligle.renderer;
    var obj = res.ligle.model;
    rd.render('member/findPW');
  })
  .post(checkEmailForm,function(req,res){
    var rd = res.ligle.renderer;
    var aMember = new Model(req.body);

    aMember.resetSendEmailLink(function(err,obj){
      rd.renderEO('member/findPW','member/sentPW',err,obj);
    });
  });

// 验证邮箱链接
router
  .route(config.email.routes.verifyReset+'/:token')
  .all(function(req,res,next){
    req.body.token = req.params.token;
    next();
  })
  .get(checkToken,function(req,res){
    var rd = res.ligle.renderer;
    var aMember = new Model();
    var token = {value:req.body.token,type:Model.TYPE.reset};
    aMember.checkEmailLink(token,function(err,obj){
      if(obj) obj.token = req.body.token;
      rd.renderEO('member/errorMsg','member/newPW',err,obj);
    });
  })
  .post(checkPwdForm,function(req,res){
    var rd = res.ligle.renderer;
    var token = {value:req.body.token,type:Model.TYPE.reset};
    var aMember = new Model(req.body);
    delete aMember.token;
    aMember.setPwdEmailLink(token,function(err,obj){
      obj = obj ||{};
      obj.token = req.body.token;
      rd.renderEO('member/newPW','member/changedPW',err,obj);
    });
  });

// 获取短信验证码
router
  .route('/getResetSMS')
  .post(checkCode,function(req,res){
    var obj = new Model(req.body);
    obj.sendVerifiedCell(Model.TYPE.reset,function(err,obj){
      if(err){
        logger.info(err);
        res.status(403).json({error:err.message});
        return;
      }
      res.sendStatus(204);
    });
  });

module.exports = router;

