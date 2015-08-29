var app = require('../../app.js');
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
var deepCopy = ligle.util.deepCopy;

var STATUS = {
  unsent:'未发送验证',
  unverified:'未验证',
  verified:'已验证'
};
var TYPE = {
  signUp:'signUp',
  reset:'reset'
};

// 模型
var Model = module.exports = ligle.model.ModelBase.extend({
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
    var initInfo = {
      token:{
        signUp:{},
        reset:{}
      }
    };
    this.emailInfo = this.emailInfo || deepCopy(initInfo);
    this.cellInfo = this.cellInfo || deepCopy(initInfo);
  },
  // 为了渲染方便，填充空白域
  fillFields:function(){
    var self = this;
    this._toFill.forEach(function(field){
      if(!(field in self)) self[field]='';
    });
  },
  _getSignUpStatusCell:function(){
    return this.cellInfo.token.signUp.status;
  },
  // 发送函数
  // 只发送验证过的手机
  sendVerifiedCell:function(type,callback){
    this.get({cellphone:this.cellphone},function(err,obj){
      if(err) return callback(err);
      if(!obj) return callback(Error('手机号未注册'));
      if(obj._getSignUpStatusCell()!==STATUS.verified) 
        return callback(Error('手机号未验证'));
      return obj.sendCell(type,callback);
    });
  },
  // 同下，为了兼容以前的调用
  sendSMS:function(type,callback){
    this.sendCell(type,callback);
  },
  // 获取短信验证码，调用的时候将会创建账户。
  sendCell:function(type,callback){
    this._getOneUser({cellphone:this.cellphone},function(err,obj){
      if(err) return callback(err);
      if(!obj._checkCanSendCell(type)) return callback(new Error(obj.errMsg));
      obj._doSendSMS(type,callback);
    });
  },
  // TODO: 发送邮箱验证码。
  sendEmail:function(type,callback){
    throw new Error('not implemented');
  },
  // 发送邮箱验证链接
  sendEmailLink:function(type,callback){
    this._getOneUser({email:this.email},function(err,obj){
      if(err) return callback(err);
      if(!obj._checkCanSendEmailLink(type)) return callback(new Error(obj.errMsg));
      obj._doSendEmailLink(type,callback);
    });
  },
  ////// 分步逻辑： 注册：保存数据库+发送令牌
  // 手机+密码注册 发送验证码：
  signUpSendCell:function(callback){
    this.signUpCell(function(err,obj){
      if(err) return callback(err);
      obj.sendCell(Model.TYPE.signUp,callback);
    });
  },
  //TODO: 邮箱+密码注册 发送验证码：
  signUpSendEmail:function(callback){
    throw Error('not implemented');
  },
  // 邮箱+密码注册 发送验证链接：
  signUpSendEmailLink:function(callback){
    this.signUpEmailLink(function(err,obj){
      if(err) return callback(err);
      obj.sendEmailLink(Model.TYPE.signUp,callback);
    });
  },
  ////// 分步逻辑：  ：验证令牌+保存数据库
  checkVerifyCell:function(token,callback){
    var query = {cellphone:this.cellphone};
    var checker = Model.checkCellToken;
    var self=this;
    this.queryCheck(query,token,checker,function(err,obj){
      if(err) return callback(err);
      delete self.cellInfo;
      delete self.emailInfo;
      obj.addData(self);
      obj.verifyCell(token.type,callback);
    });
  },
  checkVerifyEmail:function(token,callback){
    throw Error('not implemented');
  },
  checkVerifyEmailLink:function(token,callback){
    var query = {uuid:token.value};
    var checker = Model.checkEmailLinkToken;
    this.queryCheck(query,token,checker,function(err,obj){
      if(err) return callback(err);
      obj.verifyEmailLink(token.type,callback);
    });
  },
  ////// 分步逻辑：  ：检查令牌
  checkEmailLink:function(token,callback){
    var query = {uuid:token.value};
    var checker = Model.checkEmailLinkToken;
    this.queryCheck(query,token,checker,callback);
  },

  ////// 分步逻辑： 找回密码： 发送令牌+保存数据库
  resetSendCell:function(callback){
    throw Error('not implemented');
  },
  resetSendEmail:function(callback){
    throw Error('not implemented');
  },
  resetSendEmailLink:function(callback){
    this.resetEmailLink(function(err,obj){
      if(err) return callback(err);
      obj.sendEmailLink(Model.TYPE.reset,callback);
    });
  },
  ////// 分步逻辑： 设置密码：验证令牌+保存数据库
  setPwdEmailLink:function(token,callback){
    var self = this;
    self.hashPwd();
    this.get({uuid:token.value},function(err,obj){
      if(err) return callback(err);
      if(!obj) return callback(Error('找不到对象'));
      if(obj.emailInfo.token.reset.status === STATUS.unverified){
        // 修改密码之后才变更令牌状态
        obj.password = self.password;
        obj.emailInfo.token.reset.status = STATUS.verified;
        return obj.save(callback);
      }
      return callback(Error('令牌不正确'));
    });
  },
  //////  一次性完成注册和验证
  // 手机+密码+验证码 验证注册
  signUpVerifyCell:function(token,callback){
    if(!this.password) 
      return callback(new Error('password cannot be empty'));
    this.hashPwd();
    this.checkVerifyCell(token,callback);
  },
  // TODO: 邮箱+密码+验证码 验证注册
  signUpVerifyEmail:function(token,callback){
    throw Error('not implemented');
  },
  //注： 不需要 邮箱+密码+邮箱链接 验证注册 的逻辑

  // 登陆：验证用户才可以登陆。
  logInCell:function(cell,pwd,callback){
    this._logIn({cellphone:cell},pwd,'cellInfo',callback);
  },
  logInEmail:function(email,pwd,callback){
    this._logIn({email:email},pwd,'emailInfo',callback);
  },
  //////  一次性完成验证和找回密码
  // 手机+密码+验证码 
  resetVerifyCell:function(token,callback){
    if(!this.password) 
      return callback(new Error('password cannot be empty'));
    this.hashPwd();
    this.checkVerifyCell(token,callback);
  },
  resetVerifyEmail:function(token,callback){
    throw Error('not implemented');
  },
  hashPwd:function(){
    if(this.password){
      var pwd = this.password;
      this.password = tool.hashMD5(pwd);
    }
  },
///////////后面的函数内部使用，有的命名没加下划线，等我有空改。
  // 注册相关
  _signUp:function(query,errors,infoField,callback){
    var self = this;
    this.get(query,function(err,obj){
      if(err) return callback(err);
      if(obj && obj[infoField].status === STATUS.verified)
        return callback(Error(errors.occupy));
      if(!self.password) return callback(Error(errors.noPwd));
      if(obj){// 对象已存在，那么更新一下值。
        delete self.cellInfo;delete self.emailInfo;//info项不更新
        obj.addData(self);
        self = obj;
      }
      self._createUser();//创建用户和密码，如果已经创建则什么都不做
      var token = self[infoField].token.signUp;
      if(!token.status)// 如果从未没发送验证码
        token.status= STATUS.unsent;
      self.save(callback);
    });
  },
  // 注册用户，但不发送验证。
  signUpCell:function(callback){
    var query = {cellphone:this.cellphone};
    var err = {
      occupy:'手机号已经被占用',
      noPwd:'没有指定密码'
    };
    this._signUp(query,err,'cellInfo',callback);
  },
  signUpEmail:function(callback){
    var query = {email:this.email};
    var err = {
      occupy:'邮箱已经被占用',
      noPwd:'没有指定密码'
    };
    this._signUp(query,err,'emailInfo',callback);
  },
  signUpEmailLink:function(callback){
    var query = {email:this.email};
    var err = {
      occupy:'邮箱已经被占用',
      noPwd:'没有指定密码'
    };
    this._signUp(query,err,'emailInfo',callback);
  },
  // 登陆相关
  _logIn:function(query,pwd,infoField,callback){
    this.get(query,function(err,obj){
      if(err) return callback(err);
      if(!obj) return callback('not found user');
      var info = obj[infoField];
      var token = info.token;
      if(token.signUp.status !== STATUS.verified)
        return callback('unverified user');
      if(!obj._checkLoginPwd(pwd)) 
        return callback('incorrect password');
      return callback(null,obj);
    });
  },  
  // 重置密码相关：不发送验证，不修改密码，检查和标记令牌状态
  _reset:function(query,infoField,errors,callback){
    this.get(query,function(err,obj){
      if(err) return callback(err);
      if(!obj) return callback(Error(errors.notFound));
      // 查看signUp令牌状态，看是否验证过
      var token = obj[infoField].token.signUp;
      if(token.status !== STATUS.verified)
        return callback(Error(errors.unverified));
      // 修改reset令牌的状态
      token = obj[infoField].token.reset;
      if(token.status!==STATUS.unverified)// 如果没发送验证码
        token.status = STATUS.unsent;
      obj.save(callback);
    });
  },
  resetCell:function(callback){
    throw Error('not implemented');
  },
  resetEmail:function(callback){
    throw Error('not implemented');
  },
  resetEmailLink:function(callback){
    var query = {email:this.email};
    var err = {
      notFound:'邮箱不存在',
      unverified:'邮箱未验证'
    };
    this._reset(query,'emailInfo',err,callback);
  },
  // 验证相关：修改令牌状态，保存数据库
  _verify:function(infoField,type,callback){
    this[infoField].token[type].status = STATUS.verified;
    this.save(callback);
  },
  verifyCell:function(type,callback){
    this._verify('cellInfo',type,callback);
  },
  verifyEmail:function(type,callback){
    this._verify('emailInfo',type,callback);
  },
  verifyEmailLink:function(type,callback){
    this._verify('emailInfo',type,callback);
  },
  // 检查函数，用来查证 短信验证码 或 邮箱验证令牌。 检查器在文件后面定义为类方法
  queryCheck:function(query,toCheck,checker,callback){
    var self=this;
    this.get(query,function(err,obj){
      if(err) return callback(err);
      if(!obj) return callback(Error('用户不存在'));
      return obj.check(toCheck,checker,callback);
    });
  },
  check:function(toCheck,checker,callback){
    if(!checker(this,toCheck)) {
      var msg = this.checkError;
      delete this.checkError;
      return callback(new Error(msg));
    }
    return callback(null,this);
  },
  // 根据query得到用户：先查数据库，如果没有则新创建一个。
  // 注：异步返回的obj一定具备userName项。但不一定有password。
  _getOneUser:function(query,callback){
    var self = this;
    this.get(query,function(err,obj){
      if(err) return callback(err);
      if(!obj) {
        obj = self;
        obj._createUser();
      }
      callback(null,obj);
    });
  },
  _createUser:function(){
    if(!this.userName){
      this.userName = ligle.globals.userPrefix + ligle.globals.userCount;
      ligle.globals.userCount = ligle.globals.userCount+1;
    }
    if(this.password){
      this.hashPwd();
    }
  },
  // 查验验证
  _checkResend:function(infoField,cfgField,errMsg,type){
    var info = this[infoField];
    var token = info.token[type];
    var cfg = config[cfgField];
    if(token.sentTime && cfg.token.resendInterval){
      var t = ms(cfg.token.resendInterval);
      var lastSent = moment(token.sentTime);
      if(lastSent.add(t,'ms')>moment()){ 
          this.errMsg = errMsg;
          return false;
      }
    }
    return true;
  },
  _checkCanUse:function(infoField,errMsg,type){
    if(type!==TYPE.signUp) return true;
    var info = this[infoField];
    var token = info.token.signUp;
    if(token.status===STATUS.verified){
      this.errMsg = errMsg;
      return false;
    }
    return true;
  },
  _checkCanSendCell:function(type){
    if(this._checkResend('cellInfo','cell','还没到可以再次发送短信的时候',type) &&
      this._checkCanUse('cellInfo','手机号已被占用',type))
      return true;
    return false;
  },
  _checkCanSendEmail:function(type){
    if(this._checkResend('emailInfo','email','还没到可以再次发送邮件的时候',type) &&
      this._checkCanUse('emailInfo','邮箱已被占用',type))
      return true;
    return false;
  },
  _checkCanSendEmailLink:function(type){
    if(this._checkResend('emailInfo','email','还没到可以再次发送邮件的时候',type) &&
      this._checkCanUse('emailInfo','邮箱已被占用',type))
      return true;
    return false;
  },
  _doSendSMS:function(type,callback){
    var info = this.cellInfo;
    var token = info.token[type];
    var cfg = config.cell;

    var expire = ms(cfg.token.expire);
    var minute = expire/ms('1 min');

    var self = this;
    // 发送验证码
    tool.sendSmsCode( // sendSmsCodeFake 加了Fake后缀，将不会真发短信，便于调试
      this.cellphone,
      minute,
      function(err,code){
        if(err) return callback(err);

        token.type=type; 
        token.sentTime = moment().toDate();
        token.expire = moment().add(expire, 'ms').toDate();
        token.value = code;
        token.status = STATUS.unverified;

        // 保存用户账号到数据库
        self.save(function(err,obj){
          if(err) return callback(err);
          return callback(null,obj);
        });
      });
  },
  _doSendEmail:function(type,callback){
    // TODO: 这个函数应该发送验证码邮件，还不实现，因此抛出异常。
    throw new Error('unimplemented function _doSendMail');
  },
  _doSendEmailLink:function(type,callback){
    var info = this.emailInfo;
    var token = info.token[type];
    var cfg = config.email;
    var self = this;

    var value = uuid.v4();
    
    // 渲染邮箱模板使用的对象（注意，不是数据库对象）
    var obj ={};
    obj.username = this.nickname;
    obj.appname = app.appname;
    obj.url = [config.host+cfg.urlSent[type],value].join('/');
    logger.debug('emailing:',obj);
    
    tool.sendTemplateEmail(this.email,type,obj,function(err){
      if(err) return callback(err);
      var expire = ms(cfg.token.expire);

      token.type=type; 
      token.sentTime = moment().toDate();
      token.expire = moment().add(expire, 'ms').toDate();
      token.value = value;
      token.status = STATUS.unverified;

      self.uuid = value; // 方便根据uuid查找。
      self.save(callback);
    });    
  },
  _checkLoginPwd:function(pwd){
    pwd = crypto.createHash('md5').update(pwd).digest('hex');
    var hashedPwd = this.password;
    if(hashedPwd!==pwd) return false;
    return true;
  },
  coll:{name:'member',fields:{}},
  rest:{}
});


var _checkExist=function(obj){
  if(!obj) {
    obj.checkError = '找不到对象';
    return false;
  }
  return true;
};
var _checkCellToken=function(obj,token){
  var info = obj.cellInfo;
  var type = token.type;
  var savedToken = info.token[type];
  if(savedToken.value!==token.value ||
     savedToken.type!==token.type){
    obj.checkError = '手机令牌不正确：'+token.value+' type:'+token.type;
    return false;
  }
  var expire = moment(savedToken.expire);
  if(expire < moment()) {
    obj.checkError = '手机令牌过期';
    return false;
  }
  if(savedToken.status !== STATUS.unverified){
    obj.checkError = '用户手机状态不正确:'+savedToken.status;
    return false;
  }
  return true;
};

var _checkEmailLinkToken=function(obj,token){
  var info = obj.emailInfo;
  var type = token.type;
  var savedToken = info.token[type];
  var expire = moment(savedToken.expire);
  if(expire < moment()) {
    obj.checkError = '邮箱令牌过期';
    return false;
  }
  if(savedToken.status !== STATUS.unverified){
    obj.checkError = '用户邮箱状态不正确:'+savedToken.status;
    return false;
  }
  return true;
};
var _checkEmailToken=function(obj,token){
  var info = obj.emailInfo;
  var type = token.type;
  var savedToken = info.token[type];
  if(savedToken.value!==token.value ||
     savedToken.type!==token.type){
    obj.checkError = '邮箱令牌不正确：'+token.value+' type:'+token.type;
    return false;
  }
  _checkEmailLinkToken(obj,token);
};

Model.checkEmailToken = function(obj,token){
  if(!_checkExist(obj)) return false;
  return _checkEmailToken(obj,token);
};

Model.checkEmailLinkToken = function(obj,token){
  if(!_checkExist(obj)) return false;
  return _checkEmailLinkToken(obj,token);
};

Model.checkCellToken = function(obj,token){
  if(!_checkExist(obj)) return false;
  return _checkCellToken(obj,token);
};

Model.TYPE = TYPE;
Model.STATUS = STATUS;
