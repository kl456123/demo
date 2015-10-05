
var ligle = require('../index.js').ligle;
var logger = ligle.util.logger('richText.js');

// 模型
module.exports = ligle.model.ModelBase.extend({
  __className:'richText',
  __upDir:'richText',
  init:function(obj){
    this._super(obj);
  },
  coll:{name:'richText',fields:{}},
});
