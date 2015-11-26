import flux from 'control';
import {createActions} from 'alt/utils/decorators';
// var $= require('jquery');
import api from 'apis/basicAPI'

// 注意这个decorator把类变成了对象。
@createActions(flux)
class PostActions {
	constructor(){
	}

  postData(data){
  	// this.dispatch(id);
  	api.post(data)
  	.then(function(json){
  		this.actions.getBack(json);
  	})
  	.catch(function(error){
  		this.actions.getError(error);
  	});
    
  }

  /*method*/
  getBack(json){
	this.dispatch(json);
  }
  getError(error){
  	this.dispatch(error);
  }
}

export default PostActions;