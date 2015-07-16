
var ligle = require('../index.js').ligle;
var logger = ligle.util.logger('member.js');
var crypto = require('crypto');
var tool = require('../common');
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
    // TODO: send SMS here, I should write a package for doing this
    callback(null,{codeSMS:'1234'});
  },
  signUp:function(callback){
    // TODO: will send REST if configured
    var pwd = this.password;
    this.password = tool.hashMD5(pwd);
    this.save(callback);
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
      pwd = crypto.createHash('md5').update(pwd).digest('hex');
      var objPwd = obj.password;
      if(objPwd!==pwd) return callback('password incorrect');
      return callback(null,obj);
    });
  },
  coll:{name:'member',fields:{}},
  rest:{}
});



