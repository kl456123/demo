var app = require('../../app.js');
var ligle = require('../index.js').ligle;
var logger = ligle.util.logger('forgot-pw');
var config = require('../config.js');

var checkCode = ligle.addon.captcha.midware.checkCode;

var fieldChecker = ligle.midware.makeFieldChecker;
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
var Model = ligle.model.Member;
var router = app.Router();

// 手机找回密码
router
  .route(config.cell.routes.reset) 
  .get(function(req,res){
    res.rd.render('client-member/findPW');
  })
  .post(checkCellForm,function(req,res){
    var aMember = new Model(req.body);
    var token = {value:aMember.codeSMS,type:Model.TYPE.reset};
    delete aMember.codeSMS;
    delete aMember.code;

    aMember.resetVerifyCell(token,function(err,obj){
      res.rd.renderEO('client-member/findPW','client-member/changedPW',err,obj);
    });
  });

// 邮箱找回密码
router
  .route(config.email.routes.reset)
  .get(function(req,res){
    res.rd.render('client-member/findPW');
  })
  .post(checkEmailForm,function(req,res){
    var aMember = new Model(req.body);

    aMember.resetSendEmailLink(function(err,obj){
      res.rd.renderEO('client-member/findPW','client-member/sentPW',err,obj);
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
    var aMember = new Model();
    var token = {value:req.body.token,type:Model.TYPE.reset};
    aMember.checkEmailLink(token,function(err,obj){
      if(obj) obj.token = req.body.token;
      res.rd.renderEO('client-member/errorMsg','client-member/newPW',err,obj);
    });
  })
  .post(checkPwdForm,function(req,res){
    var token = {value:req.body.token,type:Model.TYPE.reset};
    var aMember = new Model(req.body);
    delete aMember.token;
    aMember.setPwdEmailLink(token,function(err,obj){
      obj = obj ||{};
      obj.token = req.body.token;
      res.rd.renderEO('client-member/newPW','client-member/changedPW',err,obj);
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

