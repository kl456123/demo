var ligle = require('../index.js').ligle;

// 路由
var router = ligle.base.routes.Router();
router
  .route('/')
  .get(function(req,res){
    var rd = res.ligle.renderer;
    rd.render('client/home');
  })
  .post(function(req,res){
  });
router
  .route('/instructions')
  .get(function(req,res){
    var rd = res.ligle.renderer;
    rd.render('client/instructions');
  })
  .post(function(req,res){
  });
router
  .route('/ligleui')
  .get(function(req,res){
    var rd = res.ligle.renderer;
    rd.render('client/ligleui');
  })
  .post(function(req,res){
  });

module.exports = router;

