var index = require('../index');
var express = require('express');
var Model = require('../model/basic.js');

var ligle = index.ligle;
var logger = ligle.util.logger('basic');

// 路由
var router = express.Router();

router
  .route('/list/basic')
  .get(function(req, res){
    var obj = new Model();
    obj.getList({}, function(err, objs){
      res.rd.renderEO('client/basic', err, {data: objs});
    });
  });

router
  .route('/detail/basic/:id')
  .get(function(req, res){
    var obj = new Model();
    var id = req.params.id;
    obj.get({_id: id}, function(err, obj){
      res.rd.renderEO('client/basic_detail', err, {data: obj});
    });
  });
module.exports = router;
