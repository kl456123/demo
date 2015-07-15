
var ligle = require('../index.js').ligle;

// 路由
var router = ligle.base.routes.Router();
router
  .route('/login')
  .get(function(req,res){
    var rd = res.ligle.renderer;
    rd.render('login');
  })
  .post(function(req,res){
  });

module.exports = router;

