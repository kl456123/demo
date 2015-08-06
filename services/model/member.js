
var ligle = require('../index.js').ligle;
var logger = ligle.util.logger('member.js');
var crypto = require('crypto');
var tool = require('../common');
var config = require('../config.js');
var uuid = require('node-uuid');
var ms = require('ms');
var moment = require('moment');

// 模型
module.exports = ligle.base.model.ModelBase.extend({
  __className:'member',
  __upDir:'member',
  _toFill:[
    'email',
    'cellphone',
    'nickname',
    'delivery_addr',
    'name',
    'address',
    'birth',
    'sex',
    'signature',
    'pro',
    'city',
    'dis'
  ],
  init:function(obj){
    this._super(obj);
  },
  fillFields:function(){
    var self = this;
    this._toFill.forEach(function(field){
      if(!(field in self)) self[field]='';
    });
  },
  getSMS:function(type,callback){
    var code = tool.sendSmsCode(
      this.cellphone,
      10,
      function(err,res,body){
        logger.trace('err:',err);
        logger.trace('body:',body);
      } // 这里是远端服务器成功确认的回调，暂时先只打个log。
    );
    callback(null,{codeSMS:code});
  },
  _createUser:function(){
    this.userName = ligle.globals.userPrefix + ligle.globals.userCount;
    ligle.globals.userCount = ligle.globals.userCount+1;
    var pwd = this.password;
    this.password = tool.hashMD5(pwd);
  },
  signUp:function(callback){
    // TODO: will send REST if configured
    this._createUser();
    this.save(callback);
  },
  signUpEmail:function(callback){
    // 发送邮件到邮箱，成功发送后返回。
    var obj={}; // 渲染email模板使用的对象
    this._createUser();
    var self = this;
    
    var token = uuid.v4();
    this.signupToken = token;

    // TODO: 对token过期进行检测。目前先不做这块。可以留给新人写。
    var timespan = ms(config.signup.tokenExpiration);
    this.signupTokenExpires = moment().add(timespan, 'ms').toDate();
    
    obj.username = this.nickname;
    obj.appname = ligle.appname;
    obj.url = [config.host+config.verify.routes,token].join('/');
    
    tool.sendTemplateEmail(this.email,'signup',obj,function(err){
      if(err) return callback(err);
      self.status = 'unverified';
      self.save(callback);
    });
  },
  resetPw:function(callback){
    self = this;
    this.get({cellphone:this.cellphone},function(err,obj){
      if(err) return callback('user not exists');
      var pwd = self.password;
      //logger.debug('set pwd:',pwd);
      //logger.debug(obj.password);
      obj.password = tool.hashMD5(pwd);
      //logger.debug(obj.password);
      obj.save(callback);
    });
  },
  logIn:function(cell,pwd,callback){
    this.get({cellphone:cell},function(err,obj){
      if(err) return callback(err);
      if(!obj) return callback('not found user');
      if(obj.status && obj.status === 'unverified') return callback('unverfied user');
      pwd = crypto.createHash('md5').update(pwd).digest('hex');
      var objPwd = obj.password;
      if(objPwd!==pwd) return callback('password incorrect');
      return callback(null,obj);
    });
  },
  logInEmail:function(email,pwd,callback){
    this.get({email:email},function(err,obj){
      if(err) return callback(err);
      if(!obj) return callback('not found user');
      if(obj.status && obj.status === 'unverified') return callback('unverfied user');
      pwd = crypto.createHash('md5').update(pwd).digest('hex');
      var objPwd = obj.password;
      if(objPwd!==pwd) return callback('password incorrect');
      return callback(null,obj);
    });
  },
  coll:{name:'member',fields:{}},
  rest:{}
});











