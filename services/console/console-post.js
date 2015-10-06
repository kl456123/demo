/**
 * Created by lenovo on 2015/10/2.
 */
var app = require('../../app.js');
var ligle = require('../index.js').ligle;
var logger = ligle.util.logger('basic');
var Model = require('../model/post.js');
var pageCalculate = ligle.util.pageCalculate;
var util = require('../util');
var createUpDirRefer = util.createUpDirRefer;
var handleRichTextUpImgs = util.handleUpImgs;
var deleteImgsUpDir = util.deleteImgsUpDir;

// 路由
var router = app.Router();
router
  .route('/a_add/basic')
  .get(function(req,res){
    res.rd.render('console/a_basic_add');
  })
  .post(function(req,res){
    var obj = new Model();

    var upDirRefer = createUpDirRefer();
    logger.trace('upDirRefer: ', upDirRefer);
    req.body.upDirRefer = upDirRefer;

    obj.addData(req.body);
    obj.processFiles(req.files);
    obj.textarea = handleRichTextUpImgs(obj.textarea, upDirRefer);
    obj.save(function(err,savedObj){
      var msg = err? err:'success saved!';
      logger.trace('saved Id',savedObj._id);
      res.rd.renderEO('console/a_basic_add',err,{msg:msg});
    });
  });

router
  .route('/a_detail/basic/:id')
  .get(function(req,res){
    logger.debug('/a_detail/basic/:id','get');
    var obj = new Model();
    obj.get({_id:req.params.id},function(err,getObj){
      res.rd.renderEO('console/a_basic_detail',err,{data:getObj});
    });
  })
  .post(function(req,res){
    var obj = new Model();
    obj.get({_id:req.params.id},function(err,getObj){
      if(err) {
        req.redirect('back');
      }

      if(!getObj.upDirRefer){
        var upDirRefer = createUpDirRefer();
        logger.trace('have refer: ', upDirRefer);
      }
      req.body.upDirRefer = getObj.upDirRefer || upDirRefer;
      getObj.addData(req.body);
      getObj.processFiles(req.files);
      getObj.textarea = handleRichTextUpImgs(
        getObj.textarea, getObj.upDirRefer);

      getObj.save(function(err,savedObj){
        res.rd.renderEO('console/a_basic_detail',err,{data:getObj});
      });
    });
  });

router
  .route('/a_basic')
  .get(function(req,res){
    var obj = new Model();
    var curPage = req.query.page?parseInt(req.query.page):1;
    obj.count({}, function(err, totalNum){
      if(err) {
        totalNum = 0;
      }
      var pObj = pageCalculate(curPage, totalNum);
      logger.trace('pObj:'+ pObj);
      obj.getList(
        {},
        {sort:{_time: -1}, skip:pObj.skipNum, limit:pObj.limitNum},
        function(err,objs){
          res.rd.render(
            'console/a_basic',
            {basic:objs, curPage:pObj.curPage, totalPage:pObj.totalPage});
        });
    });
  });

router
  .route('/a_del/basic/:id')
  .get(function(req,res){
    var obj = new Model();
    obj.delete({_id:req.params.id},function(err,getObj){
      if(err) {
        req.flash('error',err);
      }
      var refer = getObj.value.upDirRefer || '';
      deleteImgsUpDir(refer);
      res.redirect('/a_basic');
    });
  });

module.exports = router;
