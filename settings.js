/**
 * Created by swp on 15-5-29.
 * j基本设置在这里进行，这里没有的设置，请
 * z在 /routes/index.js 中进行设置
 */
module.exports = {
  // j基本设置
  host: '127.0.0.1',          // s设置数据库IP，如果你不够高端，请不要修改

  // g个性设置
  // s数据库相关
  cookieLife: 1000*60*60*24,  // cookie生存期，单位ms
  cookieSecret: 'ligleEngine',      // cookie设置，建议于工程同名
	db: 'ligleEngine',                // s数据库名称，建议与工程同名

  adminname: 'ligleEngine',    // z最高权限管理员账号名称，该账号应由程序直接写入数据库，其他账号应由注册生成

  //其他
  port: 4000,
  faviconPath: '/public/images/favicon.ico',    // w网站图标路径
  uploadPath: './public/images/upload/',   // 图片上传路径

  // 关于注册服务的配置
  loginServer:'127.0.0.1',
  //会员登陆注册服务器的通信端口3100
  loginServerPort:'3100',
  loginRoutes:{// 本服务器对接账户服务需要处理的路由
    regist:'/regist',  // :token。也要处理
    resend:'/regist/resend-verification',
    login:'/login',
    logout:'/logout',
    forgotPW:'/forgot-password', // :token也要处理
    member:'/member',
    getSMS:'/getSMS',
    registSMS:'/registSMS',
    loginSMS:'/loginSMS',
    forgotPwSMS:'/forgotPwSMS'
  },
  resendSmsWait:'60s',
  // 和服务器对接的地址，member模块使用
  loginPath:{
    /*注册账号：POST loginPath.regist
     *备注：激活账号的链接在liglLogin项目的setting.js里面配置。后缀是/regist/:token。
     *也就是前面的服务器需要处理 GET url+/regist/:token的请求，并用下面的 API （verify）验证是否成功激活
     * */
    regist:'/rest/regist',

    /*验证账号激活：GET loginPath.verify:token
     *备注：令牌过期的错误内容为："token expired"。此时需要根据这个信息让用户重新发送激活邮件。
     * */
    verify:'/rest/regist',

    /*重新发送激活账号邮件：POST loginPath.resend*/
    resend:'/rest/regist/resend-verification',

    /*登陆: POST loginPath.login*/
    login:'/rest/login',

    /*忘记密码： POST loginPath.forgotPW
     *备注：成功则会发送验证邮件。需要处理 /forgot-password/:token 的请求*/
    forgotPW:'/rest/forgot-password',

    /*是否可以重置密码：GET loginPath.canReset  过期的错误: link expired*/
    canReset:'/rest/forgot-password',

    /*查询会员信息： GET loginPath.query*/
    query:'/rest/member',

    /*重置密码： POST loginPath.resetPW*/
    resetPW:'/rest/forgot-password',

    /*更新会员信息： POST loginPath.update 注意，这个接口实现的时候，如果不传递password，那么可以正常更新信息。
     *如果传递password会对其校验。
     *如果校验失败，那么所有的传过来的信息都不会更新。
     *如果需要修改，再详细讨论一下如何好。*/
    update:'/rest/member',
    getSMS:'/rest/getSMS',// 获取手机验证码：POST loginPath.getSMS
    registSMS:'/rest/registSMS',// 注册手机账号：POST loginPath.registSMS
    loginSMS:'/rest/loginSMS',// 手机登陆: POST loginPath.loginSMS
    resetPwSMS:'/rest/setPWSMS'// 手机重置密码： POST loginPath.resetPwSMS
  }

};