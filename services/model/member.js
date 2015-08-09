
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
  unverified:'未验证',
  verified:'已验证'
};
var TYPE = {
  signup:'signup',
  reset:'reset'
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
    this.emailInfo = this.emailInfo || {status:STATUS.none,token:{}};
    this.cellInfo = this.cellInfo || {status:STATUS.none,token:{}};
  },
  fillFields:function(){
    var self = this;
    this._toFill.forEach(function(field){
      if(!(field in self)) self[field]='';
    });
  },
  // 根据query得到用户：先查数据库，如果没有则新创建一个。
  //   异步返回的obj一定具备userName项。但不一定有password。
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
  // 获取短信验证码，调用的时候将会创建账户。
  sendSMS:function(type,callback){
    this._getOneUser({cellphone:this.cellphone},function(err,obj){
      if(err) return callback(err);

      if(!obj._checkSendSMS(type)) return callback(new Error(obj.errMsg));

      obj._doSendSMS(type,callback);
    });
  },
  // 发送邮箱验证码。TODO：这个函数不能调用，因为_doSendMail并没实现。
  sendEmail:function(type,callback){
    this._getOneUser({email:this.email},function(err,obj){
      if(err) return callback(err);

      if(!obj._checkSendEmail(type)) return callback(new Error(obj.errMsg));

      obj._doSendEmail(type,callback);
    });
  },
  // 发送邮箱验证链接
  sendEmailLink:function(type,callback){
    this._getOneUser({email:this.email},function(err,obj){
      if(err) return callback(err);

      if(!obj._checkSendEmailLink(type)) return callback(new Error(obj.errMsg));

      obj._doSendEmailLink(type,callback);
    });
  },
  // 检查函数，用来查证 短信验证码 或 邮箱验证令牌。 检查器在文件后面定义为类方法
  queryCheck:function(query,toCheck,checker,callback){
    var self=this;
    this.get(query,function(err,obj){
      if(err) return callback(err);
      return obj.check(toCheck,checker,callback);
    });
  },
  check:function(toCheck,checker,callback){
    logger.debug('tocheck',toCheck);
    if(!checker(this,toCheck)) {
      var msg = this.checkError;
      delete this.checkError;
      return callback(new Error(msg));
    }
    return callback(null,this);
  },

  // 直接使用手机+密码注册。
  signUpCell:function(callback){
    var self = this;
    this.get({cellphone:this.cellphone},function(err,obj){
      if(err) return callback(err);
      if(obj && obj.cellInfo.status === STATUS.verified)
        return callback(new Error('手机号已经被占用'));
      if(!self.password) return callback(new Error('没有指定密码'));
      if(obj){// 对象已存在，那么更新一下值。
        delete self.cellInfo;delete self.emailInfo;//info项不更新
        obj.addData(self);
        self = obj;
      }
      self._createUser();//创建用户和密码，如果已经创建则什么都不做
      if(self.cellInfo.status === STATUS.none) 
        self.cellInfo.status= STATUS.unsent;
      self.save(callback);
    });
  },
  // 直接只用邮箱+密码注册。
  signUpEmail:function(callback){
    var self = this;
    this.get({email:this.email},function(err,obj){
      if(err) return callback(err);
      if(obj && obj.emailInfo.status === STATUS.verified)
        return callback(new Error('邮箱已经被占用'));
      if(!self.password) return callback(new Error('没有指定密码'));
      if(obj){
        delete self.cellInfo;delete self.emailInfo;
        obj.addData(self);
        self = obj;
      }
      self._createUser();
      if(self.emailInfo.status === STATUS.none) 
        self.emailInfo.status = STATUS.unsent;
      self.save(callback);
    });
  },
  verifyCell:function(callback){
    this.cellInfo.status = STATUS.verified;
    this.cellInfo.token={};
    this.save(callback);
  },
  verifyEmailLink:function(callback){
    this.emailInfo.status = STATUS.verified;
    this.emailInfo.token={};

    delete this.uuid; 
    this.save(callback);
  },
  // 一次性完成注册和验证：注意，此时表单项中有手机/邮箱验证码，这个是
  // 通过页面ajax发送，用户查询手机/邮箱知道的。
  signUpVerifyCell:function(tokenValue,callback){
    var self = this;
    this.signUpCell(function(err,obj){
      if(err) return callback(err);
      obj.check(tokenValue,Model.checkCellToken,function(err,obj){
        if(err) return callback(err);
        obj.verifyCell(callback);
      });
    });
  },
  // 这个函数不能使用，因为目前没做邮箱验证码逻辑，而是邮箱链接逻辑
  signUpVerifyEmail:function(tokenValue,callback){
    var self = this;
    this.signUpEmail(function(err,obj){
      if(err) return callback(err);
      obj.check(tokenValue,Model.checkEmailToken,function(err,obj){
        obj.verifyEmailLink(callback);
      });
    });
  },
  // TODO：找回密码重构
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
  _checkLoginPwd:function(pwd){
    pwd = crypto.createHash('md5').update(pwd).digest('hex');
    var hashedPwd = this.password;
    if(hashedPwd!==pwd) return false;
    return true;
  },
  // 登陆：验证用户才可以登陆。
  //   设计上保持了扩展性：可以扩展为允许非验证用户登陆后验证。
  logInCell:function(cell,pwd,callback){
    this.get({cellphone:cell},function(err,obj){
      if(err) return callback(err);
      if(!obj) return callback('not found user');

      var info = obj.cellInfo;
      if(info.status !== STATUS.verified) return callback('unverified user');
      if(!obj._checkLoginPwd(pwd)) return callback('incorrect password');

      return callback(null,obj);
    });
  },
  logInEmail:function(email,pwd,callback){
    var info = this.emailInfo;
    var cfg = config.email;
    this.get({email:email},function(err,obj){
      if(err) return callback(err);
      if(!obj) return callback(new Error('not found user'));

      var info = obj.emailInfo;
      logger.debug(info);
      if(info.status !== STATUS.verified) return callback(new Error('unverified user'));
      if(!obj._checkLoginPwd(pwd)) return callback(new Error('incorrect password'));

      return callback(null,obj);
    });
  },
  _createUser:function(){
    if(!this.userName){
      this.userName = ligle.globals.userPrefix + ligle.globals.userCount;
      ligle.globals.userCount = ligle.globals.userCount+1;
    }
    if(this.password){
      var pwd = this.password;
      this.password = tool.hashMD5(pwd);
    }
  },
  _checkSendSMS:function(type){
    var info = this.cellInfo;
    var cfg = config.cell;
    if(info.token.sentTime){
      var t = ms(cfg.token.resendInterval);
      var lastSent = moment(info.token.sentTime);
      if(lastSent.add(t,'ms')>moment() && 
         info.token.type === type){ // 只有同类验证码发送短信有时间限制
          this.errMsg = '还没到可以再次发送短信的时候';
          return false;
      }
    }
    return true;
  },
  _checkSendEmail:function(type){
    var info = this.emailInfo;
    var cfg = config.email;
    if(info.status===STATUS.verified){
      this.errMsg = '邮箱已经被占用';
      return false;
    }
    return true;
  },
  _checkSendEmailLink:function(type){
    var info = this.emailInfo;
    var cfg = config.email;
    if(info.status===STATUS.verified){
      this.errMsg = '邮箱已经被占用';
      return false;
    }
    return true;
  },
  _doSendSMS:function(type,callback){
    var info = this.cellInfo;
    var cfg = config.cell;

    var expire = ms(cfg.token.expire);
    var minute = expire/ms('1 min');

    var self = this;
    // 发送验证码
    tool.sendSmsCode(
      this.cellphone,
      minute,
      function(err,code){
        if(err) return callback(err);

        info.token.type=type; 
        info.token.sentTime = moment().toDate();
        info.token.expire = moment().add(expire, 'ms').toDate();
        info.token.value = code;

        info.status = STATUS.unverified;

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
    var cfg = config.email;
    var self = this;

    var value = uuid.v4();
    
    // 渲染邮箱模板使用的对象（注意，不是数据库对象）
    var obj ={};
    obj.username = this.nickname;
    obj.appname = ligle.appname;
    obj.url = [config.host+cfg.routes.verify,value].join('/');
    
    tool.sendTemplateEmail(this.email,type,obj,function(err){
      if(err) return callback(err);
      var expire = ms(cfg.token.expire);
      info.token.value = value;
      info.token.expire = moment().add(expire, 'ms').toDate();
      info.token.sentTime = moment().toDate();
      info.token.type=type; 

      info.status = STATUS.unverified;

      self.uuid = value; // 方便根据uuid查找。
      self.save(callback);
    });    
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
var _checkCellToken=function(obj,tokenValue){
  var info = obj.cellInfo;
  if(info.token.value!==tokenValue ||
     info.token.type!==TYPE.signup){
    obj.checkError = '手机令牌不正确：'+tokenValue+' type:'+info.token.type;
    return false;
  }
  var expire = moment(info.token.expire);
  if(expire < moment()) {
    obj.checkError = '手机令牌过期';
    return false;
  }
  if(info.status !== STATUS.unverified){
    obj.checkError = '用户手机状态不正确:'+info.status;
    return false;
  }
  return true;
};

var _checkEmailLinkToken=function(obj,tokenValue){
  var info = obj.emailInfo;
  var expire = moment(info.token.expire);
  if(expire < moment()) {
    obj.checkError = '邮箱令牌过期';
    return false;
  }
  if(info.status !== STATUS.unverified){
    obj.checkError = '用户邮箱状态不正确:'+info.status;
    return false;
  }
  return true;
};
var _checkEmailToken=function(obj,tokenValue){
  var info = obj.emailInfo;
  if(info.token.value!==tokenValue ||
     info.token.type!==TYPE.signup){
    obj.checkError = '邮箱令牌不正确：'+tokenValue+' type:'+info.token.type;
    return false;
  }
  _checkEmailLinkToken(obj,tokenValue);
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
