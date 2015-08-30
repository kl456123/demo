var app = require('../../app.js');
var ligle = require('../index.js').ligle;
var logger = ligle.util.logger('login','TRACE');

var fieldChecker = ligle.midware.makeFieldChecker;
var checkForm = fieldChecker({
  //cellphone:'cellphone',
  password:'password'
});
var checkEmailForm = fieldChecker({
  //email:'email',
  password:'password'
});

var pChecker = require('../midware/permission-checker.js');

var Model = ligle.model.Member;
var router = app.Router();
router
  .route('/loginSMS')
  .get(pChecker.passIf('member','logout'),function(req,res){
    res.rd.render('client-member/login');
  })
  .post(pChecker.passIf('member','logout'),checkForm,function(req,res){
    var obj = new Model();
    obj.logInCell(req.body.cellphone,req.body.password,function(err,member){
      if(err) return res.rd.errorBack(err.message, req.xhr);
      req.session.group='member';
      req.session.status='login';
      req.session.user = member;
      res.redirect(req.query.redirect);
    });
  });
router
  .route('/login')
  .get(pChecker.passIf('member','logout'),function(req,res){
    res.rd.render('client-member/login');
  })
  .post(pChecker.passIf('member','logout'),checkEmailForm,function(req,res){
    var obj = new Model();
    obj.logInEmail(req.body.email,req.body.password,function(err,member){
      logger.trace('error:'+ err);
      if(err) return res.rd.errorBack(err,req.xhr);
      req.session.group='member';
      req.session.status='login';
      req.session.user = member;
      res.redirect(req.query.redirect);
    });
  });


module.exports = router;
