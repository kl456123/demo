
var ligle = require('../app.js').ligle;
var logger = require('../app.js').getLogger('basic');
var basicModel = require('./basicModel.js');

// 路由
var router = ligle.base.routes.Router(basicModel);
router
  .route('/a_add/basic')
  .get(function(req,res){
    var rd = res.ligle.renderer;
    rd.render('a_basic_add');
  })
  .post(function(req,res){
    var rd = res.ligle.renderer;
    var obj = res.ligle.model;

    obj.addData(req.body);
    obj.processFiles(req.files);
    obj.save(function(err,savedObj){
      var msg = err? err:'success saved!';
      logger.trace('saved Id',savedObj._id);
      rd.renderEO('a_basic_add',err,{msg:msg});
    });
  });

router
  .route('/a_detail/basic/:id')
  .get(function(req,res){
    logger.debug('/a_detail/basic/:id','get');
    var rd = res.ligle.renderer;
    var obj = res.ligle.model;
    logger.debug(req.params.id);
    obj.get({_id:req.params.id},function(err,getObj){
      rd.renderEO('a_basic_detail',err,{data:getObj});
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
        rd.renderEO('a_basic_detail',err,{data:getObj});
      });
    });
  });

router
  .route('/a_basic')
  .get(function(req,res){
    logger.debug('/a_basic','get');
    var rd = res.ligle.renderer;
    var obj = res.ligle.model;
    obj.getList({},function(err,objs){
      rd.render('a_basic',{basic:objs});
    });
  });

router
  .route('/a_del/basic/:id')
  .get(function(req,res){
    var rd = res.ligle.renderer;
    var obj = res.ligle.model;
    logger.debug(req.params.id);
    obj.delete({_id:req.params.id},function(err,getObj){
      req.flash('error',err);
      res.redirect('/a_basic');
    });
  })

module.exports = router;

