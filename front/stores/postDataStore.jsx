import flux from 'control'
import {createStore, bind } from 'alt/utils/decorators';
import actions from 'actions/postActions';


@createStore(flux)// auto wrap privarity method such as getState() 
class PostDataStore {
	constructor(){
		this.data ={};
		this.data.age = "";
		this.data.name = "";
		this.message='pending';
	}
	@bind(actions.getBack)
	handleGetBack(json){
		// console.log('store:',json, json.value);
		this.data.age = json.value.age;
		// console.log(json.value);
		this.data.name = json.value.name;
		this.message = json.status;
	}
	@bind(actions.getError)
	handleGetError(error){
		this.data = error;
		this.message = 'error';
	}


}
export default PostDataStore;