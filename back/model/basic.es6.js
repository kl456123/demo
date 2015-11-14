'use strict';
var ligle = require('ligle-engine')();

// class shared variables
let fields = ['id','name'];
class Basic extends ligle.odm.Model
{
  updateAttr(obj){
    fields.forEach((field)=>{
      if(field in obj){
        this.set(field,obj[field]);
      }
    });
    return this;
  }
}


module.exports = Basic;
