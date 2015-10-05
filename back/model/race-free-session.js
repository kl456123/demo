var ligle = require('../index.js').ligle;
var logger = ligle.util.logger('race-free-session');

// 模型
module.exports = ligle.model.ModelBase.extend({
  __className:'rf-session',
  __upDir:'rf-session',
  init:function(obj){
    this._super(obj);
  },
  coll:{name:'rf-session',fields:{}},
  rest:{},
});
