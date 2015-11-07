
var exportObj;

function exportFrom(dir){
  return function(o){
    exportObj[o] = require(dir+o);
  };
}

module.exports = function(ligle){
  if(exportObj){
    return exportObj;
  }
  exportObj = {};
  // engine export for submodules to use
  module.exports.ligle = ligle;
  // client part
  [
    'home',
    'status',
    'basic',
    'richText',
  ].forEach(exportFrom('./client/'));

  // client-member part
  [
    'login',
    'logout',
    'sign-up',
    'forgot-pw',
    'member',
  ].forEach(exportFrom('./client-member/'));

  // console part
  [
    'console',
    'console-basic',
    'console-basic.es6',
    'console-member',
  ].forEach(exportFrom('./console/'));

  return exportObj;
};
