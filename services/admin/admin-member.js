
var ligle = require('../index.js').ligle;
var logger = ligle.util.logger('admin-member');
var Model = require('../model/member.js');
var pageCalculate = require('../common').pageCalculate;

// 路由
var router = ligle.base.routes.Router(Model);

router
  .route('/a_detail/member/:id')
  .get(function(req,res){
    var rd = res.ligle.renderer;
    var obj = res.ligle.model;
    logger.debug(req.params.id);
    obj.get({_id:req.params.id},function(err,getObj){
      getObj.fillFields();
      rd.renderEO('console/a_member_detail',err,getObj);
    });
  })
  .post(function(req,res){
    var rd = res.ligle.renderer;
    var obj = res.ligle.model;
    obj.get({_id:req.params.id},function(err,getObj){
      if(err) req.redirect('back');
      getObj.addData(req.body);
      getObj.processFiles(req.files);
      getObj.save(function(err,savedObj){
        rd.renderEO('console/a_member_detail',err,getObj);
      });
    });
  });

router
  .route('/a_member')
  .get(function(req,res){
    var rd = res.ligle.renderer;
    var obj = res.ligle.model;
    var curPage = req.query.page?parseInt(req.query.page):1;
    obj.count({}, function(err, totalNum){
      if(err) totalNum = 0;
      var pObj = pageCalculate(curPage, totalNum);
      obj.getList({},{sort:{_time:-1}, skip:pObj.skipNum, limit:pObj.limitNum}, function(err,objs){
        rd.render('console/a_member',{data:objs, curPage:pObj.curPage, totalPage:pObj.totalPage});
      });
    });
  });

module.exports = router;

