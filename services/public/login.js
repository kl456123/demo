
var ligle = require('../index.js').ligle;

var fieldChecker = require('../midware/field-checker.js');
var checkForm = fieldChecker({
  cellphone:'cellphone',
  password:'password'
});
var checkEmailForm = fieldChecker({
  email:'email',
  password:'password'
});

var pChecker = require('../midware/permission-checker.js');

var Model = require('../model/member.js');
var router = ligle.base.routes.Router(Model);
router
  .route('/loginSMS')
  .get(pChecker.passIf('member','logout'),function(req,res){
    var rd = res.ligle.renderer;
    rd.render('login');
  })
  .post(pChecker.passIf('member','logout'),checkForm,function(req,res){
    var rd = res.ligle.renderer;
    var obj = res.ligle.model;
    obj.logInCell(req.body.cellphone,req.body.password,function(err,member){
      if(err) return rd.errorBack(err);
      req.session.group='member';
      req.session.status='login';
      req.session.user = member;
      res.redirect(req.query.redirect);
    });
  });
router
  .route('/login')
  .get(pChecker.passIf('member','logout'),function(req,res){
    var rd = res.ligle.renderer;
    rd.render('login');
  })
  .post(pChecker.passIf('member','logout'),checkEmailForm,function(req,res){
    var rd = res.ligle.renderer;
    var obj = res.ligle.model;
    obj.logInEmail(req.body.email,req.body.password,function(err,member){
      if(err) return rd.errorBack(err.message,req.xhr);
      req.session.group='member';
      req.session.status='login';
      req.session.user = member;
      res.redirect(req.query.redirect);
    });
  });


module.exports = router;
