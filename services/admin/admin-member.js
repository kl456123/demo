
var ligle = require('../index.js').ligle;
var logger = ligle.util.logger('admin-member');
var Model = require('../model/member.js');

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
      rd.renderEO('a_member_detail',err,getObj);
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
        rd.renderEO('a_member_detail',err,getObj);
      });
    });
  });

router
  .route('/a_member')
  .get(function(req,res){
    var rd = res.ligle.renderer;
    var obj = res.ligle.model;
    obj.getList({},function(err,objs){
      rd.render('a_member',{data:objs});
    });
  });

module.exports = router;

