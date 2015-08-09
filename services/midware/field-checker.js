
var ligle = require('../index.js').ligle;
var logger = ligle.util.logger('field-checker');

function checkName(name){
  if(!name) return [false,'invalid name'];
	if(name ==='sessions' || name ==='system.indexes' || name ==='' || name.match(/[\:\/\?\%\&\s=]/))
		return [false,'invalid name'];
	else
		return [true,'ok'];
}

function checkEmail(email){
  var emailReg =  /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
	if(!emailReg.test(email))
		return [false,'invalid email'];
	else
		return [true,'ok'];
}

function checkUUID(uuid){
  var re = new RegExp('[0-9a-f]{22}|[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}', 'i');

  if (!re.test(uuid)) 
    return [false,'invalid uuid'];
  else
    return [true,'ok'];
}

function checkCellphone(number){
  var cellRegExp = /^1[3|4|5|8][0-9]\d{8}$/;
  if(!cellRegExp.test(number))
    return [false,'invalid cellphone number'];
  else
    return [true,'ok'];
}

function checkPassword(pwd){
  if(!pwd) return [false,'password is empty'];
  if(pwd==='')
    return [false,'password is empty'];
  else
    return [true,'ok'];
}

var checkers = {
  email:checkEmail,
  cellphone:checkCellphone,
  name:checkName,
  password:checkPassword,
  uuid:checkUUID
};


/**
 * 中间件生成器：生成检查域的中间件。
 * @method
 * @param {obj} checkCfg 检查的配置。格式为{fields:checkerName}
 * @return {null}
 * @example
 * checker({nickname:'name',email:'email',phone:'cellphone'})
 */
var checker = module.exports=function(checkCfg){
  return function(req,res,next){
    for(var key in checkCfg){
      var result = checkers[checkCfg[key]](req.body[key]);
      var pass = result[0],msg = result[1];
      if(!pass){
        var rd = res.ligle.renderer;
        rd.errorBack(msg,req.xhr);
        return;
      }
    }
    next();
  }
}

