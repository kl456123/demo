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
  'signup',
  'forgotPW',
  'status',
  'member'
].forEach(exportFrom('./public/'));


// admin part
[
  'admin-basic',
  'admin-commodity',
  'admin-member',
].forEach(exportFrom('./admin/'));

