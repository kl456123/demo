
var ligle = require('../index.js').ligle;

var fieldChecker = require('../midware/field-checker.js');
var checkForm = fieldChecker({
  cellphone:'cellphone',
  password:'password'
});

var pChecker = require('../midware/permission-checker.js');

var Model = require('../model/member.js');
var router = ligle.base.routes.Router(Model);
router
  .route('/login(SMS)?')
  .get(pChecker.passIf('member','logout'),function(req,res){
    var rd = res.ligle.renderer;
    rd.render('login');
  })
  .post(pChecker.passIf('member','logout'),checkForm,function(req,res){
    var rd = res.ligle.renderer;
    var obj = res.ligle.model;
    obj.logIn(req.body.cellphone,req.body.password,function(err,member){
      if(err) return rd.errorBack(err);
      req.session.group='member';
      req.session.status='login';
      req.session.user = member;
      res.redirect(req.query.redirect);
    });
  });

module.exports = router;











