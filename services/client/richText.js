
var app = require('../../app.js');
var ligle = require('../index.js').ligle;
var Model = require('../model/richText.js');
var logger = ligle.util.logger('richText');
var basicModel = require('../model/basic.js');
var fs = require('fs');

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
    getImgTags(basicModel);
    //logger.trace('imgTags: ', imgTags);
    //var imgPaths = getImgPaths(imgTags);
    //logger.trace(imgPaths);
    res.end();
  });

module.exports = router;


//[{model: Model, richTextName: textarea}, {}, ]

var getImgTags = function(Model){
  var obj = new Model();
  var imgHtmlReg = /<img[^>]*>/g;      //匹配img标签 <img ...>
  var imgTags = [];
  obj.getList({textarea: imgHtmlReg}, function(err, objs){ //匹配出所有含img的条目
    objs.forEach(function(o, i){       //textarea: "<p><img src= ><p>..."
      var imgTagsTemp = o.textarea.match(imgHtmlReg);   //[ <img >, <img>,  ]
      logger.trace('imgTagsTemp: ', imgTagsTemp);
      for(var j = 0;j<imgTagsTemp.length;j++){
        imgTags.push(imgTagsTemp[j]);
      }
    });
    logger.trace(imgTags);
    getImgPaths(imgTags);
  });
}

var getImgPaths = function(imgTags){
  var imgPaths = [];
  for(var i=0;i<imgTags.length;i++){
    var temp = getPath(imgTags[i]);
    logger.trace('temp: ', temp);
    imgPaths.push(temp);
  }
  logger.trace(imgPaths);
  removeRichTextImg(imgPaths);
}

var getPath = function(o){
  var imgSrcReg = /src=\"\/images\/upload\/richText\/([^\s\"]*)\"/g;
  var matched = o.match(imgSrcReg);
  if(matched === null) return;
  var path = matched[0].replace(imgSrcReg,"$1");
  logger.trace('path: ', path);
  return path;
}

var removeRichTextImg = function(paths){
  var obj = new Model();
  var upLoadDir = obj.getUploadDir();
  logger.trace('uploadDir: ', upLoadDir);
  fs.readdir(upLoadDir, function(err, files){
    logger.trace('files: ',files);
    files.forEach(function(filename, i){
      if(paths.indexOf(filename) === -1){
        logger.trace(filename);
        fs.unlinkSync(upLoadDir+filename);
      }
    });
  });
}