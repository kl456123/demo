
var app = require('../../app.js');
var ligle = require('../index.js').ligle;
var Model = require('../model/richText.js');
var logger = ligle.util.logger('richText');
var fs = require('fs');

var router = app.Router();

//上传文件
router
  .route('/richTextImgUpload')
  .post(function(req, res){
    var obj = new Model();
    var filePaths = [];
    logger.trace('req.files: ', req.files);

    //create temp文件夹
    var tempUpDir = obj.getUploadDir() + 'temp';
    var tempHostDir = obj.getHostDir() + 'temp';
    if(!fs.existsSync(tempUpDir)) fs.mkdirSync(tempUpDir);

    //save temp pics to temp directory
    var fieldname = 'file';
    var filelist;
    if(!req.files[fieldname]){
      return res.send(new Error('wrong'));
    }
    if(req.files[fieldname] instanceof Array){
      filelist = req.files[fieldname];
    }else{
      filelist = [req.files[fieldname]];
    }
    filelist.forEach(function(o,i){
      var newPath = tempUpDir+'/'+o.name; // 文件实际保存的path
      var showPath = tempHostDir+'/'+o.name;// 渲染模板用的path
      fs.renameSync(o.path,newPath);
      filePaths.push(showPath);
    });

    logger.trace('filePaths: ', filePaths);
    return res.send(filePaths);
  })

module.exports = router;
