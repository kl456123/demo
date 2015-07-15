
var ligle = require('../index.js').ligle;
var logger = ligle.util.logger('signup');
var cfg = {
  resendSmsWait:'60s',
};
var moment = require('moment');//设置验证码过期时间
var ms = require('ms');

var ccMidware = require('../midware/check-code.js');
var getCode = ccMidware.getCode;
var checkCode = ccMidware.checkCode;

var Model = require('../model/member.js');

// 路由
var router = ligle.base.routes.Router(Model);
router
  .route('/regist(SMS)?')
  .get(function(req,res){
    var rd = res.ligle.renderer;
    rd.render('regist');
  })
  .post(function(req,res){
    var rd = res.ligle.renderer;
    if(req.body.codeSMS!==req.session.codeSMS ||
      'regist'!==req.session.type){
      return rd.renderEO('regist',{error:'短信验证码错误'});
    }

    var aMember = new Model(req.body);
    aMember.signUp(function(err, obj){
      if(err) rd.renderEO('regist',{error:JSON.stringify(err)});
      rd.renderEO('regist_verified',null,obj);
    });
  });

// 获取图片验证码
router
  .route('/getCode')
  .get(getCode);

// 获取短信验证码
router
  .route('/getSMS')
  .post(checkCode,function(req,res){
    logger.trace('will try send SMS');
    var obj = res.ligle.model;
    obj.getSMS(req.body.type,function(err,obj){
      if(req.session.resendStamp && moment(req.session.resendStamp) > moment()){
        var errmsg= '必须等待'+cfg.resendSmsWait+'才能再次发送验证码';
        res.status(403).json({error:errmsg});
        return;
      }
      var resendSmsWait = ms(cfg.resendSmsWait);
      req.session.resendStamp = moment().add(resendSmsWait,'ms').toDate();
      req.session.codeSMS = obj.codeSMS;
      req.session.type = req.body.type;
      res.sendStatus(204);
    });
  });

module.exports = router;

