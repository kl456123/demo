var ligle = require('../index.js').ligle;

// 模型
module.exports = ligle.base.model.ModelBase.extend({
  __className:'commodity',
  __upDir:'commodity',
  init:function(obj){
    this._super(obj);
  },
  coll:{name:'commodity',fields:{}},
  rest:{}
});
