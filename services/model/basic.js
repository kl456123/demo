
var ligle = require('../index.js').ligle;
var logger = ligle.util.logger('basic.js');

// 模型
module.exports = ligle.model.ModelBase.extend({
  __className:'basic',
  __upDir:'basic',
  init:function(obj){
    this._super(obj);
  },
  coll:{name:'basic',fields:{}},
  rest:{}
});
