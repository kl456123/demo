var ligle = require('../index.js').ligle;
var verifyCode = require('../midware/verify-code.js');
var getCode = verifyCode.getCode;

var Model = require('../model/member.js');
var router = ligle.base.routes.Router(Model);
// 获取图片验证码
router
  .route('/getCode')
  .get(getCode);

module.exports = router;
