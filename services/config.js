
module.exports = {
  signup:{
    routes:'/regist',
    tokenExpiration:'1 day',
    smsCodeExpiration:'10 min',
    smsResendInterval:'60 s'
  },
  verify:{
    routes:'/verify'
  },
  host:'http://localhost:4000'
};
