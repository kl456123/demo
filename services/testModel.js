var ligle = require('../app.js').ligle;
var logger = require('../app.js').getLogger('testModel');

// 模型
module.exports = ligle.base.model.ModelBase.extend({
  __classname:'testModel',
  __updir:'test',
  init:function(obj){
    this._super(obj);
  },
  coll:{name:'test',fields:{}},
  rest:{}
});
