var app = require('../../app.js');
var ligle = app.ligle;

// 路由
var router = app.Router();
router
  .route('/')
  .get(function(req,res){
    res.rd.render('client/home');
  })
  .post(function(req,res){
  });
router
  .route('/instructions')
  .get(function(req,res){
    res.rd.render('client/instructions');
  });
router
  .route('/ligleui')
  .get(function(req,res){
    res.rd.render('client/ligleui');
  });


module.exports = router;

