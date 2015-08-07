
var ligle = require('../index.js').ligle;
var logger = ligle.util.logger('member.js');
var crypto = require('crypto');
var tool = require('../common');
var config = require('../config.js');
var uuid = require('node-uuid');
var ms = require('ms');
var moment = require('moment');
ligle.util = require('ligle-util');
var deepEqual = ligle.util.deepEqual;

var STATUS = {
  none:'无',
  unsent:'未发送验证',
  unverfied:'未验证',
  verfied:'已验证'
};

// 模型
var Model = module.exports = ligle.base.model.ModelBase.extend({
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
    this.status = this.status || {cell:STATUS.none,email:STATUS.none};
  },
  fillFields:function(){
    var self = this;
    this._toFill.forEach(function(field){
      if(!(field in self)) self[field]='';
    });
  },
  // 获取短信验证码，调用的时候将会创建账户。
  getSMS:function(type,callback){
    var self = this;
    this.get({cellphone:this.cellphone},function(err,obj){
      if(!obj) {
        obj = self;
        obj._createUser();
      }
      // 验证是否到了可以再次发送短信的时间
      if(obj.cellSignupTokenSendTime){
        var t = ms(config.signup.smsResendInterval);
        var lastSent = moment(obj.cellSignupTokenSendTime);
        if(lastSent.add(t,'ms')>moment() && 
           obj.cellSignupTokenType === type){ // 只有同类验证码发送短信有时间限制
          return callback(new Error('还没到可以再次发送短信的时候'));
        }
      }
      // 保存验证码类型
      obj.cellSignupTokenType=type;

      // 保存发送时间
      obj.cellSignupTokenSendTime = moment().toISOString();

      // 记录短信验证码失效时间
      var timespan = ms(config.signup.smsCodeExpiration);
      obj.cellSignupTokenExpires = moment().add(timespan, 'ms').toISOString();
      var timespan_min = timespan/ms('1 min');

      // 发送验证码
      tool.sendSmsCode(
        obj.cellphone,
        timespan_min,
        function(err,code){
          if(err) return callback(err);
          self.cellSignupToken = code;
          self.status.cell = STATUS.unverified;
          // 保存用户账号到数据库
          self.save(function(err,obj){
            if(err) return callback(err);
            return callback(null,{codeSMS:code});
          });
        }
      );
    });
  },
  // 获取邮箱验证链接
  getEmail:function(type,callback){
    
  },
  // 检查函数，用来查证 短信验证码 或 邮箱验证令牌。 检查器在文件后面定义为类方法
  check:function(query,toCheck,checker,callback){
    this.get(query,function(err,obj){
      if(err) return callback(err);
      if(!checker(obj,toCheck)) return callback(this.checkError);
      return callback(err,obj);
    });
  },
  // 直接使用手机+密码注册。demo的例子里并没用到这个函数
  signUpCell:function(callback){
    this.get({cellphone:this.cellphone},function(err,obj){
      if(err) return callback(err);
      if(obj) return callback(new Error('手机号已经被占用'));
      if(!this.password) return callback(new Error('没有指定密码'));
      this._createUser();
      this.status.cell = STATUS.unsent;
      this.save(callback);
    });
  },
  // 直接只用邮箱+密码注册。
  signUpEmail:function(callback){
    // 发送邮件到邮箱，成功发送后返回。
    var obj={}; // 渲染email模板使用的对象
    this._createUser();
    var self = this;
    
    var token = uuid.v4();
    this.emailSignupToken = token;

    var timespan = ms(config.signup.tokenExpiration);
    this.emailSignupTokenExpires = moment().add(timespan, 'ms').toDate();
    
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
  _createUser:function(){
    this.userName = ligle.globals.userPrefix + ligle.globals.userCount;
    ligle.globals.userCount = ligle.globals.userCount+1;
    if(this.password){
      var pwd = this.password;
      this.password = tool.hashMD5(pwd);
    }
  },
  coll:{name:'member',fields:{}},
  rest:{}
});


var _checkField=function(obj,toCheck){
  for(var k in toCheck){
    if(!deepEqual(obj[k],toCheck[k])){
      obj.checkError = '检查项:（'+k+'）失败';
      return false;
    }
  }
  return true;
};
var _checkExist=function(obj){
  if(!obj) {
    obj.checkError = '找不到对象';
    return false;
  }
  return true;
};

Model.checkEmailSignupToken = function(obj,toCheck){
  if(!_checkExist(obj)) return false;
  if(!_checkField(obj,toCheck)) return false;

  var expire = moment(obj.emailSignupTokenExpires);
  if(expire > moment()) {
    obj.checkError = '邮箱令牌过期';
    return false;
  }
  if(obj.status.email !== STATUS.unverfied){
    obj.checkError = '用户邮箱状态不正确:'+obj.status.email;
    return false;
  }
  delete obj.emailSignupToken;
  delete obj.emailSignupTokenExpires;
  return true;
};

Model.checkCellSignupToken = function(obj,toCheck){
  if(!_checkExist(obj)) return false;
  if(!_checkField(obj,toCheck)) return false;

  var expire = moment(obj.cellSignupTokenExpires);
  if(expire > moment()) {
    obj.checkError = '手机令牌过期';
    return false;
  }
  if(obj.status.cell !== STATUS.unverfied){
    this.checkError = '用户手机状态不正确:'+obj.status.cell;
    return false;
  }
  delete obj.cellSignupToken;
  delete obj.cellSignupTokenExpires;
  return true;
};







