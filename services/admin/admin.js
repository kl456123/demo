
var ligle = require('../index.js').ligle;
var logger = ligle.util.logger('admin');

var router = ligle.base.routes.Router();
router
  .route('/admin')
  .get(function(req,res){
    var rd = res.ligle.renderer;
    rd.render('console/a_index');
  });
module.exports = router;
