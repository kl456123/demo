var $ = require('jquery');
export default {
  fetch:function() {
    // returning a Promise because that is what fetch does.
    return new Promise(function (resolve, reject) {
      // simulate an asynchronous action where data is fetched on
      // a remote server somewhere.
      $.getJSON('rest/basic?title=llldsafa',function(data){
        let json = data.value;
        resolve(json);
      }).error(function(obj,text,err){
        reject(err);
      });
    });
  },
  post:function(data){
    return new Promise(function(resolve,reject){
      
      $.post('rest/basic',data,function(json){
        resolve(json);
      }).error(function(obj,text,err) {
        reject(err);
      });
    });
  },
};
