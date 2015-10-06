/**
 * Created by lenovo on 2015/10/4.
 */
var ligle = require('../index.js').ligle;
var logger = ligle.util.logger('post.js');

//模型
module.exports = ligle.model.ModelBase.extend({
  __className:'post',
  __upDir:'post',
  init:function(obj){
    this._super(obj);
  },
  coll:{name:'post',fields:{}},
  rest:{},
});