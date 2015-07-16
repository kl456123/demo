
var ligle = require('../index.js').ligle;
var logger = ligle.util.logger('forgot-pw');

var fieldChecker = require('../midware/field-checker.js');
var checkForm = fieldChecker({
  cellphone:'cellphone',
  password:'password'
});

// 路由
var Model = require('../model/member.js');
var router = ligle.base.routes.Router(Model);
router
  .route('/forgotPwSMS|forgot-password')
  .get(function(req,res){
    var rd = res.ligle.renderer;
    var obj = res.ligle.model;
    rd.render('findPW');
  })
  .post(checkForm,function(req,res){
    var rd = res.ligle.renderer;
    var obj = res.ligle.model;
    if(req.body.codeSMS!==req.session.codeSMS ||
      'reset'!==req.session.type){
      return rd.renderError('findPW','短信验证码错误');
    }
    var aMember = new Model(req.body);
    //logger.debug(req.body);
    //logger.debug(aMember);
    aMember.resetPw(function(err,obj){
      rd.renderEO('findPW','changedPW',err,obj);
    });
  });

module.exports = router;

