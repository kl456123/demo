var ligle = require('../index.js').ligle;
var logger = ligle.util.logger('get-sms');
var cfg = {
  resendSmsWait:'60s',
};

var verifyCode = require('../midware/verify-code.js');
var checkCode = verifyCode.checkCode;

var moment = require('moment');//设置验证码过期时间
var ms = require('ms');

var Model = require('../model/member.js');
var router = ligle.base.routes.Router(Model);

// 获取短信验证码
router
  .route('/getSMS')
  .post(checkCode,function(req,res){
    var obj = new Model(req.body);
    logger.trace(obj);
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
