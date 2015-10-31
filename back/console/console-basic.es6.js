var app = require('express');
var co = require('co');
//var logger = ligle.util.logger('basic');

var Basic = require('../model/basic.es6');

/// api 规范：
// options，查询参数，动作参数等等，全部放在这个属性里面。
//   options.query ：查询参数
// data，数据放在这里面。比如更新，创建等动作需要数据。

// 路由
var router = app.Router();
router
  .route('/rest/basic')
  .delete(function(req,res){// delete
    co(function*(){
      yield Basic.remove(req.body.options.query);
    }).then(function(value){
      res.json({status:'success',value});
    },function(err){
      res.json({status:'error',err});
    });
  })
  .post(function(req,res){// create
    co(function*(){
      var basic = new Basic(req.body.data);
      return yield basic.save();
    }).then(function(value){
      res.json({status:'success',value});
    },function(err){
      res.json({status:'error',err});
    });
  })
  .get(function(req,res){// get
    co(function*(){
      return yield Basic.findOne(req.body.options.query);
    }).then(function(value){
      res.json({status:'success',value});
    },function(err){
      res.json({status:'error',err});
    });
  })
  .put(function(req,res){// update
    co(function*(){
      var basic = yield Basic.findOne(req.body.options.query);
      if(!basic) {
        throw Error('not found');
      }
      basic.updateAttr(req.body.data);
      return yield basic.save();
    }).then(function(value){
      res.json({status:'success',value});
    },function(err){
      res.json({status:'error',err});
    });
  });

module.exports = router;

