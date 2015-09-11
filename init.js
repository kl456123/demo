var fs = require('fs');
var path = require('path');

// do some initialize works: create root user

// depends on ligle.globals
var init = function(ligle,bReset){
  if(!ligle.globals) throw Error('need ligle globals plugin');
  var logger = ligle.util.logger('init','TRACE');
  if(bReset){
    logger.trace('....force initialization....');
    ligle.globals.bInit = false; // provide options to force init
  }
  if(ligle.globals.bInit) return;
  ligle.globals.bInit = true;

  // used for creating userName
  ligle.globals.userCount = ligle.globals.userCount || 0;
  ligle.globals.userPrefix = ligle.globals.userPrefix || 'user';

  // root user
  ligle.globals.root = {};
  ligle.globals.root.name = ligle.cfg.app.root.name;
  var pwd = ligle.cfg.app.root.password;
  ligle.globals.root.password = ligle.util.hashMD5(pwd);
};

module.exports = init;
