var ligle = require('../index.js').ligle;
var logger = ligle.util.logger('member');

var pChecker = require('../midware/permission-checker.js');


var Model = require('../model/member.js');
var router = ligle.base.routes.Router(Model);
router
  .route('/member')
  .get(pChecker.passIf('member','login'),function(req,res){
    var rd = res.ligle.renderer;
    rd.render('member',{data:req.session.user});
  });

module.exports = router;

