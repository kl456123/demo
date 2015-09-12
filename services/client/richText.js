
var app = require('../../app.js');
var ligle = require('../index.js').ligle;
var Model = require('../model/richText.js');
var logger = ligle.util.logger('richText');
var basicModel = require('../model/basic.js');
var fs = require('fs');
var moment = require('moment');
var async = require('async');

var router = app.Router();

//上传文件
router
  .route('/richTextImgUpload')
  .post(function(req, res){
    var obj = new Model();
    var filePaths = [];
    logger.trace('req.files: ', req.files);
    obj.processFiles(req.files);
    if(obj.file instanceof Array){
      obj.file.forEach(function(o, i){
        filePaths.push(o.path);
      });
    }else{
      filePaths.push(obj.file.path);
    }
    logger.trace('filePaths: ', filePaths);
    return res.send(filePaths);
  })


router
  .route('/test')
  .get(function(req, res){
    clearImgPath([basicModel]);
    res.end();
  });


module.exports = router;


//[{model: Model, richTextName: textarea}, {}, ]

var clearImgPath = function(ModelArray){
  async.map(ModelArray, getImgPaths, function(err, results){
    if(err) results = [];
    logger.trace('results: ', err, results[0]);
    removeRichTextImg(results[0]);
  });
};

var getImgPaths = function(Model, cb){
  var obj = new Model();
  var imgHtmlReg = /<img[^>]*>/g;
  var imgPaths = [];
  obj.getList({textarea: imgHtmlReg}, function(err, objs){ //匹配出所有含img的条目
    objs.forEach(function(o, i){
      var imgTags = o.textarea.match(imgHtmlReg);  //[]
      logger.trace('imgTags: ', imgTags);
      for(var j = 0;j<imgTags.length;j++){
        var tempImgPath = getPath(imgTags[j]);   //获取所有<img>标签的src路径
        imgPaths.push(tempImgPath);
      };
    });
    //logger.trace(imgTags);
    cb(null, imgPaths);
  });
};

var getPath = function(path){
  var imgSrcReg = /src=\"([^\s\"]*)\"/g;
  var matched = path.match(imgSrcReg);
  if(matched === null) return;
  var path = matched[0].replace(imgSrcReg,"$1");
  //logger.trace('path: ', path);
  return path;
}


var removeRichTextImg = function(paths){
  var obj = new Model();
  var upLoadDir = obj.getUploadDir();
  logger.trace('uploadDir: ', upLoadDir);
  fs.readdir(upLoadDir, function(err, files){
    logger.trace('files: ',files);
    files.forEach(function(filename, i){
      var temp = obj.upload2HostPath(upLoadDir)+filename;
      logger.trace('temp: ', temp);
      if(paths.indexOf(temp) === -1){
        fs.unlinkSync(upLoadDir+filename);
      }
    });
  });
}