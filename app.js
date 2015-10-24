var argv = require('minimist')(process.argv.slice(2)); // 命令行解析
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
var MongoStore = require('connect-mongo')(session);

var webpack = require('webpack');
var webpackConfig = require('./webpack.config');
var compiler = webpack(webpackConfig);

var cfg = require('./config.js');
var ligle = require('ligle-engine')(cfg);

var logger = ligle.util.logger('normal','TRACE');

// export for services to use
exports.getLogger = ligle.util.logger;
exports.appname = 'demo';// 应用名称，发邮件的时候会使用。
exports.Router = express.Router.bind(express);
exports.ligle = ligle;

var UPDIR = cfg.app.upload.path;

// wrap app into callback, so that we can do something before we
// start. such as: open database

// engine plugins
require('ligle-plugin-globals')(ligle);

// engine addons
require('ligle-addon-captcha')(ligle);
require('ligle-addon-permission')(ligle);

// model extensions
require('ligle-model-member')(ligle);

// init function
var init = require('./init.js');

/* jshint ignore:start */
ligle.start(function(){
  /* jshint ignore:end */
  // do some initialize works.  can force init by passing second argument
  init(ligle,argv.reset);

  var app = express();

  // all environments
  app.set('port', process.env.PORT || cfg.app.http.port);
  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'ejs');

  app.use(favicon(cfg.app.favicon.path));
  app.use(methodOverride());
  app.use(log4js.connectLogger(logger, {level:log4js.levels.INFO}));
  app.use(bodyParser.json());
  // bodyParser: false to use querystring
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(multer({ dest: UPDIR}));
  app.use(cookieParser(cfg.app.cookie.secret));
  app.use(session({
    secret: cfg.app.cookie.secret,
    name: cfg.db.name,
    cookie: {maxAge: cfg.app.cookie.life},
    store: new MongoStore({db: cfg.db.name}),
    resave: false,
    saveUninitialized: false,
  }));
  app.use(flash()); // used to save message into req temporarily

  app.use(require("webpack-dev-middleware")(compiler, {
    noInfo: true, publicPath: webpackConfig.output.publicPath
  }));
  app.use(require("webpack-hot-middleware")(compiler));

  // new framework
  app.use(ligle.midware.addRenderer);

  // addons
  app.use(ligle.addon.captcha.route);


  // 自定义的服务。

  // 这里的语句不能放在文件开头，因为services也依赖app.js。（好好思索一
  // 下，为什么必须放在这里，以及模块互相依赖的时候，是如何加载的）
  var localService = require('./back')(ligle);
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
  if ('development' === env) {
    // configure stuff here
    app.use(errorHandler());
  }


  http.createServer(app).listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
  });

  /* jshint ignore:start */
});
/* jshint ignore:end */


