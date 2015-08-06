
var express = require('express');
var http = require('http');
var path = require('path');
var favicon = require('serve-favicon');
var methodOverride = require('method-override');
var session = require('express-session');
var bodyParser = require('body-parser');
var qs = require('querystring');
var multer = require('multer');
var flash = require('connect-flash');
var cookieParser = require('cookie-parser');
var log4js = require('log4js');

var errorHandler = require('errorhandler');
var serveStatic = require('serve-static');
var mongoStore = require('connect-mongo')(session);
var settings = require('./settings');
var cfg = {
//  logLevel:'DEBUG', // TODO add log control
  'ligle-model':{
    upDir:'./public/images/upload/',
    staticDir:'/images/upload/'
  },
  'ligle-db': { 
    db: 'ligleEngine', 
    host: '127.0.0.1', 
    port: 27017
  },
  'ligle-routes': {
  }
};

var ligle = require('ligle-engine')(cfg);
ligle.appname = 'demo';// 应用名称，发邮件的时候会使用。

var logger = ligle.util.logger('normal','TRACE');
// export something to use for other modules
exports.ligle = ligle;
var getLogger = exports.getLogger = ligle.util.logger;

// to suppress the verbose log
/*
getLogger('ligle-base','INFO');
getLogger('ligle-middware','INFO');
getLogger('ligle-routes','INFO');
getLogger('ligle-model','INFO');
getLogger('ligle-db','INFO');
*/
var UPDIR = settings.uploadPath;

// wrap app into callback, so that we can do something before we
// start. such as: open database

// engine plugins
var pluginGlobals = require('ligle-plugin-globals');
pluginGlobals(ligle);

ligle.start(function(){
  // init some globals config
  ligle.globals.userCount = ligle.globals.userCount || 0;
  ligle.globals.userPrefix = ligle.globals.userPrefix || 'user';

  var app = express();

  // all environments
  app.set('port', process.env.PORT || settings.port);
  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'ejs');


  app.use(favicon(settings.faviconPath ? __dirname + '/public/images/favicon.ico' : ''));
  app.use(methodOverride()); 
  app.use(log4js.connectLogger(logger, {level:log4js.levels.INFO}));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));// false to use querystring
  app.use(multer({ dest: UPDIR}));
  app.use(cookieParser(settings.cookieSecret));
  app.use(session({
	  secret: settings.cookieSecret,
	  name: settings.db,
	  cookie: {maxAge: settings.cookieLife},
	  store: new mongoStore({db: settings.db}),
    resave: false,
    saveUninitialized: false
  }));
  app.use(flash()); // used to save message into req temporarily

  // new framework

  // engine里面的服务，并没有完成，因此先不要使用，先自己开发。
  // var globalService = ligle.service;
  // app.use(globalService.basic);

  // 自定义的服务。

  // 这里的语句不能放在文件开头，因为services也依赖app.js。（好好思索一
  // 下，为什么必须放在这里，以及模块互相依赖的时候，是如何加载的）
  var localService = require('./services');
  for(var s  in localService){
    var router = localService[s];
    if(router instanceof Function){
      logger.debug('adding routes:',s);
      app.use(localService[s]);
    }
  }

  app.use(serveStatic(path.join(__dirname, 'public')));

  app.use(function(req,res){
	  res.ligle.renderer.render('error');
  });

  // development only
  var env = process.env.NODE_ENV || 'development';
  if ('development' == env) {
    // configure stuff here
    app.use(errorHandler());
  }


  http.createServer(app).listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
  });
});

