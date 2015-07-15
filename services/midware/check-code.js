var ligle = require('../index.js').ligle;
var logger = ligle.util.logger('check-code');

var ccap = require('ccap')({
  width: 180,
  height: 60,
  generate: function(){
    var str = '';
    for(var i = 0; i<4; i++){
      if(Math.random()>0.5)
        str += String.fromCharCode(parseInt(Math.random()*26)+65);
      else
        str += parseInt(Math.random()*10);
    }
    return str;
  }
});
var moment = require('moment');//设置验证码过期时间
var ms = require('ms');


var RFSession = require('../model/race-free-session.js');
var rfSession = new RFSession();

function flashBack(req,res,msg){
  req.flash('error', msg);
  res.redirect('back');
}

function sendCheckCodeErr(req,res,msg,ajax){
  if(!ajax){
    flashBack(req,res,msg);
    return;
  }
  else{
    res.status(403).json({error:msg});
    return;
  }
};

var checkCode= exports.checkCode = function(req,res,next){
  var ajax = req.xhr;
  var code = req.body.code.toLowerCase();
  delete req.body.ajax;//这个应该删掉。以前不知道可以直接查到是否ajax。
  delete req.body.code;//删除body中的验证码，免得存入数据库。
  rfSession.get({sid:req.sessionID},function(err,data){
    var originCode = data.code.toLowerCase();
    if(!data.code){
      logger.trace('checking','服务器没有生成验证码');
      return sendCheckCodeErr(req,res,'服务器没有生成验证码',ajax);
    }
    if(!code){
      logger.trace('checking','提交的表单没有找到验证码项');
      return sendCheckCodeErr(req,res,'提交的表单没有找到验证码项',ajax);
    }
    if(originCode === code)
      next();
    else{
      logger.trace('checking','验证码错误');
      return sendCheckCodeErr(req,res,'验证码错误',ajax);
    }
  });
};

var getCode = exports.getCode = function(req,res,next){
  var ary = ccap.get();

  var code = ary[0]+'';
  var buf  = ary[1];

  var rfSess = new RFSession();

  rfSess.get({sid:req.sessionID},function(err,data){
    if(err) return flashBack(req,res,err);
    if(!data) data = new RFSession();
    data.addData({sid:req.sessionID,code:code});
    data.save(function(err,data){
      if(err) return flashBack(req,res,err);
      res.end(buf);
    });
  });
}
