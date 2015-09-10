
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

var cfg = require('./config.js');
var ligle = require('ligle-engine')(cfg.engine);

var logger = ligle.util.logger('normal','TRACE');

// export for services to use
exports.getLogger = ligle.util.logger;
exports.appname = 'demo';// 应用名称，发邮件的时候会使用。
exports.Router = express.Router.bind(express);
exports.ligle = ligle;

var settings = cfg.settings;
var UPDIR = cfg.engine.model.upDir;

// wrap app into callback, so that we can do something before we
// start. such as: open database

// engine plugins
require('ligle-plugin-globals')(ligle);

// engine addons
require('ligle-addon-captcha')(ligle);
require('ligle-addon-permission')(ligle);

// model extensions
require('ligle-model-member')(ligle);

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
  app.use(ligle.midware.addRenderer);

  // addons
  app.use(ligle.addon.captcha.route);


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
	  res.rd.render('part/error');
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

