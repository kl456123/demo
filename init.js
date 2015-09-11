var fs = require('fs');
var path = require('path');

// do some initialize works: mkdir, create root user

// depends on ligle.globals
var init = function(ligle,bReset){
  if(!ligle.globals) throw Error('need ligle globals plugin');
  if(bReset) ligle.globals.bInit = false; // provide options to force init
  if(ligle.globals.bInit) return;
  ligle.globals.bInit = true;

  // used for creating userName
  ligle.globals.userCount = ligle.globals.userCount || 0;
  ligle.globals.userPrefix = ligle.globals.userPrefix || 'user';

  // mkdir for upload
  var upDir = ligle.cfg.app.upload.path;
  rMakeDir(upDir);

  // root user
  ligle.root = {};
  ligle.root.name = ligle.cfg.app.root.name;
  var pwd = ligle.cfg.app.root.password;
  ligle.root.password = ligle.util.hashMD5(pwd);
};

var rMakeDir = function(dir){
  if(fs.existsSync(dir)){
    return;
  }else{
    var p = path.parse(dir);
    rMakeDir(p.dir);
    fs.mkdirSync(dir);
  }
};

module.exports = init;
