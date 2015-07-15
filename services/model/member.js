
var ligle = require('../index.js').ligle;
var logger = ligle.util.logger('member.js');

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
    callback(null,{codeSMS:'1234'});
  },
  signUp:function(callback){
    if(this.codeSMS==='1234'){
      this.save(callback);
    }else{
      callback(new Error('code SMS error'));
    }
  },
  coll:{name:'member',fields:{}},
  rest:{}
});
