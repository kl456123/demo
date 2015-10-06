var ligle = require('../index.js').ligle;
var logger = ligle.util.logger('basic1.js');

//模型
module.exports = ligle.model.ModelBase.extend({
  __className:'basic1',
  __upDir:'basic1',
  init:function(obj){
    this._super(obj);
  },
  coll:{name:'basic1',fields:{}},
  rest:{},
});
