var app = require('../../app.js');
var ligle = require('../index.js').ligle;
var logger = ligle.util.logger('admin-member');
var Model = require('../model/member.js');
var pageCalculate = require('../common').pageCalculate;

// 路由
var router = app.Router();

router
  .route('/a_detail/member/:id')
  .get(function(req,res){
    var obj = new Model();
    logger.debug(req.params.id);
    obj.get({_id:req.params.id},function(err,getObj){
      getObj.fillFields();
      res.rd.renderEO('console/a_member_detail',err,getObj);
    });
  })
  .post(function(req,res){
    var obj = new Model();
    obj.get({_id:req.params.id},function(err,getObj){
      if(err) req.redirect('back');
      getObj.addData(req.body);
      getObj.processFiles(req.files);
      getObj.save(function(err,savedObj){
        res.rd.renderEO('console/a_member_detail',err,getObj);
      });
    });
  });

router
  .route('/a_member')
  .get(function(req,res){
    var obj = new Model();
    var curPage = req.query.page?parseInt(req.query.page):1;
    obj.count({}, function(err, totalNum){
      if(err) totalNum = 0;
      var pObj = pageCalculate(curPage, totalNum);
      obj.getList({},{sort:{_time:-1}, skip:pObj.skipNum, limit:pObj.limitNum}, function(err,objs){
        res.rd.render('console/a_member',{data:objs, curPage:pObj.curPage, totalPage:pObj.totalPage});
      });
    });
  });

module.exports = router;

