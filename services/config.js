
module.exports = {
  email:{
    routes:{
      signUp:'/regist',
      verify:'/verify',
      reset:'/forgot-password',
      verifyReset:'/verifyReset'
    },
    urlSent:{// 发送到邮件使用的路由
      signUp:'/verify',
      reset:'/verifyReset'
    },
    token:{
      expire:'1 day'
    }
  },
  cell:{
    routes:{
      signUp:'/registSMS',
      reset:'/forgotPwSMS'
    },
    token:{
      resendInterval:'60 s',
      expire:'10 min'
    }
  },
  host:'http://localhost:4000'
};
