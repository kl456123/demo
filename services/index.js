// engine export for submodules to use
exports.ligle = require('../app.js').ligle;

function exportFrom(dir){
  return function(o){
    exports[o] = require(dir+o);
  };
};

// public part
[
  'home',
  'login',
  'logout',
  'sign-up',
  'forgot-pw',
  'status',
  'member',
  'get-code'
].forEach(exportFrom('./public/'));


// admin part
[
  'admin',
  'admin-basic',
  'admin-member',
].forEach(exportFrom('./admin/'));

