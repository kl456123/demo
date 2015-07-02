var ligle = require('../app.js').ligle;
var testModel = require('./testModel.js');

// 路由
var router = ligle.base.routes.Router(testModel);
router
  .route('/')
  .get(function(req,res){
    var rd = res.ligle.renderer;
    rd.render('index');
  })
  .post(function(req,res){
  });

module.exports = router;

