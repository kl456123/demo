
var ligle = require('../index.js').ligle;
var logger = ligle.util.logger('admin');

var router = ligle.base.routes.Router();
router
  .route('/admin')
  .get(function(req,res){
    var rd = res.ligle.renderer;
    rd.render('console/a_index');
  });

//测试用的路由
router
  .route('/a_setAdmin')
  .get(function(req,res){
    var rd = res.ligle.renderer;
    rd.render('console/setAdmin');
  });
router
  .route('/a_pics')
  .get(function(req,res){
    var rd = res.ligle.renderer;
    rd.render('console/a_pics');
  });
router
  .route('/a_changePW')
  .get(function(req,res){
    var rd = res.ligle.renderer;
    rd.render('console/a_changePW');
  });
module.exports = router;
