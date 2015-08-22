var ligle = require('../index.js').ligle;
var logger = ligle.util.logger('member-page');

var pChecker = require('../midware/permission-checker.js');
var fieldChecker = require('../midware/field-checker.js');
var checkPhone = fieldChecker({
  cellphone:'cellphone',
});
var checkReset = fieldChecker({
  cellphone:'cellphone',
  password:'password',
  newpassword:'password',
});

var tool = require('../common');

var Model = require('../model/member.js');
var router = ligle.base.routes.Router(Model);
router
  .route('/member')
  .get(pChecker.passIf('member','login'),function(req,res){
    var rd = res.ligle.renderer;
    rd.render('member/member',{data:req.session.user});
  })
  .post(pChecker.passIf('member','login'),checkPhone,function(req,res){
    var rd = res.ligle.renderer;
    var obj = res.ligle.model;
    obj.get({cellphone:req.body.cellphone},function(err,member){
      if(err) return rd.errorBack(err,req.xhr);
      // 不处理修改密码，用新的路由处理修改密码
      delete req.body.password;
      delete req.body.newpassword;
      member.addData(req.body); // 根据前端传来的信息修改
      member.save(function(err,member){
        rd.successBack("成功更新",req.xhr);
      });
    });
  });
router
  .route('/member-reset')
  .post(pChecker.passIf('member','login'),checkReset,function(req,res){
    var pwd = req.body.password;
    var newPwd = req.body.newpassword;
    var rd = res.ligle.renderer;
    var obj = res.ligle.model;
    if(pwd===newPwd) return rd.errorBack('新密码与原密码一致',req.xhr);
    obj.get({cellphone:req.body.cellphone},function(err,obj){
      if(err) return rd.errorBack('用户不存在',req.xhr);
      var pwd = tool.hashMD5(pwd);
      if(pwd!==obj.password) return rd.errorBack('密码错误，修改失败',req.xhr);
      obj.password = tool.hashMD5(newPwd);
      logger.trace('new password:',newPwd);
      obj.save(function(err,obj){
        if(err) return rd.errorBack('数据库错误',req.xhr);
        return rd.successBack('密码修改成功',req.xhr);
      });
    });
  });

//测试用的路由
router
  .route('/changeEmail')
  .get(function(req,res){
    var rd = res.ligle.renderer;
    rd.render('member/changeEmail');
  });
router
  .route('/changeCellphone')
  .get(function(req,res){
    var rd = res.ligle.renderer;
    rd.render('member/changeCellphone');
  });
router
  .route('/change_expired')
  .get(function(req,res){
    var rd = res.ligle.renderer;
    rd.render('member/change_expired');
  });
router
  .route('/change_success')
  .get(function(req,res){
    var rd = res.ligle.renderer;
    rd.render('member/change_success');
  });
module.exports = router;
