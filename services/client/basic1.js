var app = require('../../app.js');
var ligle = require('../index.js').ligle;
var logger = ligle.util.logger('basic1');
var Model = require('../model/basic1.js');
var Model_1=require('../model/post.js');
var util= require('../util');
var createUpDirRefer =util.createUpDirRefer;
var handleRichTextUpImgs=util.handleUpImgs;
var deleteImgsUpDir =util.deleteImgsUpDir;



// 路由
var router = app.Router();

router
  .route('/test')
  .get(function(req,res){
    if(req.session.status==='logout'){
      res.redirect('/login');
    }
    res.redirect('/basic1');
  });

router
  .route('/list/basic2')
  .get(function(req, res){
    var obj = new Model();
    obj.getList({}, function(err, objs){
      res.rd.renderEO('client/basic2', err, {data: objs});
    });
  });

router
  .route('/list/post')
  .get(function(req, res){
    var obj = new Model_1();
    obj.getList({}, function(err, objs){
      res.rd.renderEO('client/see1', err, {data1: objs});
    });
  });

router
  .route('/basic1')
  .get(function(req, res){
    res.rd.render('client/basic1');
  })
  .post(function(req,res){
    var obj=new Model();

    var date=new Date();
    var time1=date.getFullYear()+'-'+(date.getMonth()+1)+'-'+date.getDate()+
      ' '+
      date.getHours()+':'+(date.getMinutes()<10 ? '0'+
      date.getMinutes():date.getMinutes());
    req.body.time=time1;

    var upDirRefer=createUpDirRefer();
    logger.trace('upDirRefer:',upDirRefer);
    req.body.upDirRefer=upDirRefer;

    obj.addData(req.body);
    //obj.textarea=handleRichTextUpImgs(obj.textarea,upDirRefer);
    obj.save(function(err,savedObj){
      var msg=err ? err:'success comment!';
      logger.trace('saved Id',savedObj._id);
      res.rd.renderEO('client/basic1',err,{msg:msg});
    });
  });

router
  .route('/post')
  .get(function(req,res){
    res.rd.render('client/post');
  })
  .post(function(req,res){
    var obj=new Model_1();

    var upDirRefer=createUpDirRefer();
    logger.trace('upDirRefer:',upDirRefer);
    req.body.upDirRefer=upDirRefer;

    obj.addData(req.body);
    obj.save(function(err,savedObj){
      var msg=err ? err:'success post!';
      logger.trace('saved Id',savedObj._id);
      res.rd.renderEO('client/post',err,{msg:msg});
    });
  });

router
  .route('/detail/post/:id')
  .get(function(req,res){
    var obj=new Model_1();
    obj.get({_id:req.params.id},function(err,obj){
      res.rd.renderEO('client/detail_post',err,{data1:obj});
    });
  });

router
  .route('/detail/basic1/:id')
  .get(function(req,res){
    var obj=new Model();
    obj.get({_id:req.params.id},function(err,obj){
      res.rd.renderEO('client/basic1',err,{data:obj});
    });
  });



router
  .route('/delete1/basic1/:id')
  .get(function(req,res){
    var obj=new Model();
    obj.delete({_id:req.params.id},function(err,getObj){
      if(err){
        req.flash('error',err);
      }
      var refer=getObj.value.upDirRefer || '';
      deleteImgsUpDir(refer);
      res.redirect('/list/basic2');
    });
  });


router
  .route('/delete1/post/:id')
  .get(function(req,res){
    var obj=new Model_1();
    obj.delete({_id:req.params.id},function(err,getObj){
      if(err){
        req.flash('error',err);
      }
      var refer=getObj.value.upDirRefer || '';
      deleteImgsUpDir(refer);
      res.redirect('/list/post');
    });
  });
module.exports = router;