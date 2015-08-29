var ligle = require('../index.js').ligle;
var logger = ligle.util.logger('verify-code');
var common = require('../common');
var ccap = require('ccap')({
  width: 180,
  height: 60,
  generate: common.makeCodeGen(4)
});
var moment = require('moment');//设置验证码过期时间
var ms = require('ms');

// race-free-session
var RFSession = require('../model/race-free-session.js');
var rfSession = new RFSession();

var checkCode= exports.checkCode = function(req,res,next){
  var ajax = req.xhr;
  var code = req.body.code.toLowerCase();
  delete req.body.code;//删除body中的验证码，免得存入数据库。

  rfSession.get({sid:req.sessionID},function(err,data){
    if(!data.code){
      logger.trace('checking','服务器没有生成验证码');
      return res.rd.errorBack('服务器没有生成验证码',ajax);
    }
    if(!code){
      logger.trace('checking','提交的表单没有找到验证码项');
      return res.rd.errorBack('提交的表单没有找到验证码项',ajax);
    }
    var originCode = data.code.toLowerCase();
    if(originCode === code)
      next();
    else{
      logger.trace('checking','验证码错误');
      return res.rd.errorBack('验证码错误',ajax);
    }
  });
};

var getCode = exports.getCode = function(req,res,next){
  var ary = ccap.get();

  var code = ary[0]+'';
  var buf  = ary[1];

  var rfSess = new RFSession();

  rfSess.get({sid:req.sessionID},function(err,data){
    if(err) return res.end();
    if(!data) data = new RFSession();
    data.addData({sid:req.sessionID,code:code});
    data.save(function(err,data){
      if(err) return res.end();
      res.end(buf);
    });
  });
}
