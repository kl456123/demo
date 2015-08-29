// engine export for submodules to use
exports.ligle = require('../app.js').ligle;

function exportFrom(dir){
  return function(o){
    exports[o] = require(dir+o);
  };
};

// client part
[
  'home',
  'status',
  'get-code',
].forEach(exportFrom('./client/'));

// client-member part
[
  'login',
  'logout',
  'sign-up',
  'forgot-pw',
].forEach(exportFrom('./client-member/'));

// console part
[
  'console',
  'console-basic',
  'console-member',
].forEach(exportFrom('./console/'));

