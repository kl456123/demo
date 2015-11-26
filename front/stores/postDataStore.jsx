import flux from 'control'
import {createStore, bind } from 'alt/utils/decorators';
import actions from 'actions/postActions';


@createStore(flux)// auto wrap privarity method such as getState() 
class PostDataStore {
	constructor(){
		this.data ="breakpoint";
		this.message='pending';
	}
	@bind(actions.getBack)
	handleGetBack(json){
		this.data = json.value;
		this.message = 'success';
	}
	@bind(actions.getError)
	handleGetError(error){
		this.data = error;
		this.message = 'error';
	}


}
export default PostDataStore;