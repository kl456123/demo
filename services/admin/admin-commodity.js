
var ligle = require('../index.js').ligle;
var logger = ligle.util.logger('commodity');
var Model = require('../model/commodity.js');

// 路由
var router = ligle.base.routes.Router(Model);
router
  .route('/a_add/commodity')
  .get(function(req,res){
    var rd = res.ligle.renderer;
    rd.render('a_commodity_add');
  })
  .post(function(req,res){
    var rd = res.ligle.renderer;
    var obj = res.ligle.model;

    obj.addData(req.body);
    obj.processFiles(req.files);
    obj.save(function(err,savedObj){
      var msg = err? err:'success saved!';
      logger.trace('saved Id',savedObj._id);
      rd.renderEO('a_commodity_add',err,{msg:msg});
    });
  });

router
  .route('/a_detail/commodity/:id')
  .get(function(req,res){
    logger.debug('/a_detail/commodity/:id','get');
    var rd = res.ligle.renderer;
    var obj = res.ligle.model;
    logger.debug(req.params.id);
    obj.get({_id:req.params.id},{sort:{_time:-1}},function(err,getObj){
      rd.renderEO('a_commodity_detail',err,{data:getObj});
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
        rd.renderEO('a_commodity_detail',err,{data:getObj});
      });
    });
  });

router
  .route('/a_commodity')
  .get(function(req,res){
    logger.debug('/a_commodity','get');
    var rd = res.ligle.renderer;
    var obj = res.ligle.model;
    logger.debug(obj.hasOwnProperty('__upDir'));
    logger.debug(obj._getUpDir());
    obj.getList({},{sort:{_time:-1}},function(err,objs){
      rd.render('a_commodity',{commodity:objs});
    });
  });

router
  .route('/a_del/commodity/:id')
  .get(function(req,res){
    var rd = res.ligle.renderer;
    var obj = res.ligle.model;
    logger.debug(req.params.id);
    obj.delete({_id:req.params.id},function(err,getObj){
      req.flash('error',err);
      res.redirect('/a_commodity');
    });
  })

module.exports = router;

