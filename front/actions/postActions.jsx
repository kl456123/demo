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
    api.post(data)
			.then((json) => {
      this.actions.getBack(json);
			})
			.catch((errorMessage) => {
				this.actions.getError(errorMessage);
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