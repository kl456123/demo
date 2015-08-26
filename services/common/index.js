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
    datas:[code.toString(),expire.toString()]
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
  request(postOptions, function(err,res,body){
    callback(err,code);
  });
};
exports.sendSmsCodeFake = function(to,expire,callback){
  var code = smsCodeGen();
  callback(null,code);
};

var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
var options = {
  host: "115.28.149.231",
  port: 25,
  auth: {
    user: 'hi@ligle.net',
    pass: 'hi1ig1e',
  }
};
var transporter = nodemailer.createTransport(smtpTransport(options));
var emailFrom = 'no-reply@ligle.net';

var sendEmail = exports.sendEmail = function(to,subject,content,callback){
  var options = {
    from: emailFrom,
    to: to,
    subject: subject,
    html: content
  };
  transporter.sendMail(options, function(err, res){
    if(err) return callback(err);
    transporter.close(); // shut down the connection pool, no more messages
    callback(null, res);
  });
};

var templates = {};
templates.signUp = {
  subject: '欢迎注册 <%- appname %>',
  text: [
    '<h2>您好 <%- username %></h2>',
    '欢迎注册 <%- appname %>.',
    '<p> <%- link %> 完成注册.</p>',
    ' 或者在拷贝以下链接，在浏览器中打开',
    ' <%- url%>',
  ].join('<br />'),
  linkText: '点击这里'
};

// email already taken template
templates.occupy = {
  subject: '邮箱已经注册',
  text: [
    '<h2>您好 <%- username %></h2>',
    ' 您正在尝试注册 <%- appname %>.',
    '<p>您的邮箱已经注册，不能重复注册',
    ' 如果不是您本人进行注册，您可以忽略这封邮件</p>',
    ' 使用如下链接找回密码',
    ' <%- url%>',
    '<p>The <%- appname %> Team</p>'
  ].join('<br />')
};

// resend signUp template
templates.resend = {
  subject: '完成您的注册',
  text: [
    '<h2>您好 <%- username %></h2>',
    ' <%- link %>完成注册',
    ' 或者在拷贝以下链接，在浏览器中打开',
    ' <%- url%>',
    '<p>The <%- appname %> Team</p>'
  ].join('<br />'),
  linkText: '点击这里'
};

// forgot password template
templates.reset = {
  subject: '重置密码',
  text: [
    '<h2>您好 <%- username %></h2>',
    '<%- link %> 重置密码',
    ' 或者在拷贝以下链接，在浏览器中打开',
    ' <%- url%>',
    '<p>The <%- appname %> Team</p>'
  ].join('<br />'),
  linkText: '点击这里'
};

var fs = require('fs');
var path = require('path');
var ejs = require('ejs');

// obj需要提供appname, username, url
var sendTemplateEmail = exports.sendTemplateEmail=function(to,tmpName,obj,cb){
  fs.readFile(path.join(__dirname, 'emailBoiler.html'), 'utf8', function(err, data) {
    if (err) return cb(err);
    var tmp = templates[tmpName];
    var locals = {
      title: '',
      content: tmp.text
    };

    var html = ejs.render(data, locals);
    obj.link = '<a href="' + obj.url + '">' + tmp.linkText + '</a>';
    html = ejs.render(html,obj);

    var subject = ejs.render(tmp.subject,obj);

    sendEmail(to,subject,html,cb);
  });
};


//page calculate
var pageCalculate = exports.pageCalculate = function(curPage, totalNum){
  var pageNum = 2;
  var plus = totalNum%pageNum === 0?0:1;
  var totalPage = parseInt(totalNum/pageNum) +plus;
  if(totalPage <= 0) totalPage = 1;
  if(curPage >= totalPage) curPage = totalPage;
  if(curPage <= 1) curPage = 1;
  var skipNum = (curPage -1)*pageNum;
  var limitNum = pageNum;
  return {curPage:curPage, totalPage:totalPage, skipNum:skipNum, limitNum:limitNum}
}