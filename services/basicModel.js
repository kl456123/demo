var ligle = require('../app.js').ligle;
var logger = require('../app.js').getLogger('basicModel');

// 模型
module.exports = ligle.base.model.ModelBase.extend({
  __className:'basic',
  __upDir:'basic',
  init:function(obj){
    this._super(obj);
  },
  coll:{name:'basic',fields:{}},
  rest:{}
});
