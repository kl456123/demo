
module.exports = {
  email:{
    routes:{
      signup:'/regist',
      verify:'/verify'
    },
    token:{
      expire:'1 day'
    }
  },
  cell:{
    routes:{
      signup:'/registSMS'
    },
    token:{
      resendInterval:'60 s',
      expire:'10 min'
    }
  },
  host:'http://localhost:4000'
};
