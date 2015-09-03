
var app = require('../../app.js');
var ligle = require('../index.js').ligle;
var Model = require('../model/richText.js');
var logger = ligle.util.logger('richText');

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


module.exports = router;



