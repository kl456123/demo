
var app = require('../../app.js');
var ligle = require('../index.js').ligle;
var Model = require('../model/richText.js');
var logger = ligle.util.logger('richText');
var basicModel = require('../model/basic.js');

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
    var imgTags = getImgTags(basicModel);
    logger.trace('1111111111111111111111111111');
    logger.trace('imgTags: ', imgTags);
    var imgPaths = getImgPaths(imgTags);
    logger.trace(imgPaths);
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
    return imgTags;
  });
}

var getImgPaths = function(imgTags){
  logger.trace('2222222222222222222222222222');
  var imgPaths = [];
  for(var i=0;i<imgTags.length;i++){
    var temp = getPath(imgTags[i]);
    imgPaths.push(temp);
  }
  logger.trace(imgPaths);
}

var getPath = function(o){
  var imgSrcReg = /src=\"([^\s\"]*)\"/g;
  var matched = o.match(imgSrcReg);
  if(matched === null) return;
  matched.forEach(function(m, i){
    return m.replace(imgSrcReg,"\"$1\"");
  });
}

var removeRichTextImg = function(paths){

}