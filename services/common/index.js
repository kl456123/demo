// 写一些简单的便捷函数。
// 使用成熟的会集成到底层去

var crypto = require('crypto');
var request = require('request');
var util = require('util');
var moment = require('moment');

var hashMD5 = exports.hashMD5 = function(str){
  return crypto.createHash('md5').update(str).digest('hex');
};

var createTimeStamp = exports.createTimeStamp = function(fmt){
  return moment().format(fmt);
};
var randChar = exports.randChar = function (){
  return String.fromCharCode(parseInt(Math.random()*26)+65);
};
var randDigit = exports.randDigit = function (){
  return parseInt(Math.random()*10);
};

var randCharAndDigit = function(mode){
  if(Math.random()>0.5) return randChar();
  else return randDigit();
};

var makeCodeGen = exports.makeCodeGen = function(length,mode){
  length = length || 1;
  mode = mode || 'both';
  if(mode==='both'){
    return function(){
      var container = new Array(length);
      for(var i = 0; i<length; i++){
        container[i] = randCharAndDigit();
      }
      return container.join('');
    }
  }else if(mode==='digit'){
    return function(){
      var container = new Array(length);
      for(var i = 0; i<length; i++){
        container[i] = randDigit();
      }
      return container.join('');
    }
  }else{
    throw Error('support mode: digit/both; not support:'+mode);
  }
};


// 放到闭包里的变量，免得调用时反复创建
// 一些固定的配置
var ServerIP = "https://sandboxapp.cloopen.com";
var ServerPort = "8883";
var SoftVersion = "2013-12-26";
var TimeFmt = 'YYYYMMDDHHmmss';
var AccountSid = "aaf98f894dae9c16014db3891fc3045c";
var AccountToken = "8a0d3b22dbcf4ed3848c837c7367179a";
var AppId = "aaf98f894dae9c16014db3899afa045e";
var AppToken = "99c4ba07c862cff55250ecb31af13cb9";
var smsCodeGen = makeCodeGen(6,'digit');
var Func = "SMS";
var Funcdes = "TemplateSMS";

/// 发送短信功能
var sendSmsCode = exports.sendSmsCode = function(to,expire,callback){
  // api的url
  var timeStamp = createTimeStamp(TimeFmt);
  var sigParameter = hashMD5(AccountSid+AccountToken+timeStamp).toUpperCase();
  var url = util.format(
    '/%s/Accounts/%s/%s/%s?sig=%s',
    SoftVersion,
    AccountSid,
    Func,
    Funcdes,
    sigParameter
  );
  // http包头
  var authBuff = new Buffer(AccountSid+':'+timeStamp);
  var authcode = authBuff.toString('base64');
  var headers = {
    'Accept':'application/json',
    'Content-Type':'application/json;charset=utf-8',
    'Authorization':authcode
  };
  
  var code = smsCodeGen();
  // api调用参数
  var body = {
    to:to,
    templateId:'1',
    appId:AppId,
    datas:[code,expire.toString()]
  };

  // request调用信息:post选项
  var postOptions = { 
    method: 'POST', 
    baseUrl:ServerIP+':'+ServerPort,
    url: url,
    json:true,
    body:body,
    headers:headers
  };
  request(postOptions, callback);
  return code;
};





