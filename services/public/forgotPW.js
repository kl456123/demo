
var ligle = require('../index.js').ligle;

// 路由
var router = ligle.base.routes.Router();
router
  .route('/')
  .get(function(req,res){
    var rd = res.ligle.renderer;
    rd.render('index');
  })
  .post(function(req,res){
  });

module.exports = router;
