var app = require('../../app.js');
var ligle = require('../index.js').ligle;
var logger = ligle.util.logger('basic');
var Model = require('../model/basic.js');

// 路由
var router = app.Router();

router
  .route('/list/basic')
  .get(function(req, res){
    var obj = new Model;
    obj.getList({}, function(err, objs){
      res.rd.renderEO('client/basic', err, {data: objs});
    });
  });

router
  .route('/detail/basic/:id')
  .get(function(req, res){
    var obj = new Model;
    var id = req.params.id;
    obj.get({_id: id}, function(err, obj){
      res.rd.renderEO('client/basic_detail', err, {data: obj});
    });
  });
module.exports = router;
