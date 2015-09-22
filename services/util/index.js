
// nothing all moved to ligle-util
var RichTextModel = require('../model/richText.js');
var fs = require('fs');
var uuid = require('node-uuid');

var getRealUpDir = function(uuid){
  var obj = new RichTextModel();
  var realUpDir = obj.getUploadDir()+uuid;
  return realUpDir;
};

var getRealHostDir = function(uuid){
  var obj = new RichTextModel();
  var realHostDir = obj.getHostDir()+uuid;
  return realHostDir;
};

var getTempUpDir = function(){
  var obj = new RichTextModel();
  var tempUpDir = obj.getUploadDir()+'temp';
  return tempUpDir;
};

var getTempHostDir = function(){
  var obj = new RichTextModel();
  var tempHostDir = obj.getHostDir()+'temp';
  return tempHostDir;
};

//创建uuid文件夹
var createUpDirRefer = exports.createUpDirRefer = function(){
  var refer = uuid.v1();
  var realUpDir = getRealUpDir(refer);
  fs.mkdirSync(realUpDir);
  return refer;
};

//1.实现图片文件的转移存储; 2.修改对应html(textarea)的图片显示路径
var handleUpImgs = exports.handleUpImgs = function(html, refer){
  var showTempPaths = matchImgSrc(html);
  if(showTempPaths.length === 0) {
    return html;
  }
  tempToReferUpDir(showTempPaths, refer);
  html = replaceImgSrc(html, refer);
  removeNoReferImgs(html, refer);
  return html;
};

//替换图片显示路径temp to refer(uuid) 返回替换后的html
var replaceImgSrc = function(html, refer){
  var imgSrcReferReg = /(<img src=\"[^\s]*)temp([^\s]*\"[^>]*>)/g;
  var reHtml = html.replace(imgSrcReferReg, '$1'+refer+'$2');
  return reHtml;
};

//<img src='/images/upload/richText/temp/93a717d6d197a59214fc1a4e40a45fed.png'>
//匹配html中所有src路径，返回 []
var matchImgSrc = function(html){
  if(!html) {
    html='';
  }
  var showPaths = [];
  var imgSrcReg = /<img src=\"([^\s\"]*)\"[^>]*>/g;
  var matched = html.match(imgSrcReg);
  if(matched === null) {
    return showPaths;
  }
  matched.forEach(function(o, i){
    var path = o.replace(imgSrcReg, '$1');
    showPaths.push(path);
  });
  return showPaths;
};

//转移temp文件夹中图片到refer文件夹
var tempToReferUpDir = function(tempPaths, refer){
  var tempHostDir = getTempHostDir();     //'/images/.../temp'
  var tempUpDir = getTempUpDir();         //'./public/images/.../temp'
  var realUpDir = getRealUpDir(refer);    //'./public/images/.../uuid'
  tempPaths.forEach(function(o, i){
    filename = o.slice(tempHostDir.length);

    //'./public/images/upload/richText/temp/filename'
    var oldPath = tempUpDir+'/'+filename;

    //'./public/images/upload/richText/uuid/filename'
    var newPath = realUpDir+'/'+filename;

    if(fs.existsSync(oldPath)) {
      fs.renameSync(oldPath, newPath);  //rename
    }
  });
};

var removeNoReferImgs = function(html, refer){
  var realUpDir = getRealUpDir(refer);
  var files = fs.readdirSync(realUpDir);
  files.forEach(function(o, i){
    var filePath = realUpDir + '/'+ o;
    if(html.indexOf(o) === -1) {
      fs.unlinkSync(filePath);
    }
  });
};

var deleteImgsUpDir = exports.deleteImgsUpDir = function(refer){
  if(!refer) {
    return;
  }
  var delPath = getRealUpDir(refer);
  removeNoReferImgs('', refer);
  fs.rmdirSync(delPath);
};
