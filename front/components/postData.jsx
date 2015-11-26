import React from 'react';
import connectToStores from 'alt/utils/connectToStores';
import store from 'stores/postDataStore';
import action from 'actions/postActions';



var  PostData = React.createClass({


  getInitialState(){
  	return store.getState();
  },
	postData(){
		var ss = {
			name:"breakpoint",
			age:19,
		};
		action.postData(ss);
		this.setState({data:"new"});
	},
	

	componentDidMount(){
		store.listen(this.onChange);
	},

	compoentWillUnmount(){
		store.unlisten(this.onChange);
	},

	onChange(state){
		this.setState(state);
	},

	render(){
		
				// 			name:<input type="text" value={data.name}/>
				// age :<input type="text" value={data.age} />
		if(!this.state){
			return <p>ohno</p>;
		}else{
			return (
				<div>
				<p>json:{this.state.data}</p>
				<p>status:{this.state.message}</p>
				<button onClick={this.postData}>Post</button>
				</div>

				);
		}
				
			
			
		
	},
});
export default PostData ;
