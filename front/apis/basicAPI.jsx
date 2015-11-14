var $ = require('jquery');

export default {
  fetch:function() {
    // returning a Promise because that is what fetch does.
    return new Promise(function (resolve, reject) {
      // simulate an asynchronous action where data is fetched on
      // a remote server somewhere.
      $.getJSON('rest/basic/1.json',function(json){
        resolve(json);
      }).error(function(obj,text,err){
        reject(err);
      });
    });
  },
}
