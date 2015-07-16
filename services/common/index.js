// 写一些简单的便捷函数。
// 使用成熟的会集成到底层去


var crypto = require('crypto');
exports.hashMD5=function(str){
  return crypto.createHash('md5').update(str).digest('hex');
};

