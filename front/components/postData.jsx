import React from 'react';
import connectToStores from 'alt/utils/connectToStores';
import store from 'stores/postDataStore';
import action from 'actions/postActions';

var storeInfo = store.getState();

var PostData = React.createClass({


  getInitialState() {
    storeInfo.nowName = "";
    storeInfo.nowAge = "";
    return storeInfo;
  },
  postData() {
    let data = {
      name: this.state.nowName,
      age: this.state.nowAge,
    };
    action.postData(data);
    this.resetData();
  },
  resetData() {
    this.setState(
      {
        nowName: "",
        nowAge: "",
      }
    );
  },

  componentDidMount() {
    store.listen(this.onChange);
  },

  compoentWillUnmount() {
    store.unlisten(this.onChange);
  },

  onChange(state) {
    this.setState(state);
  },

  onChangeNowName(event) {
    this.setState({
      nowName: event.target.value,
    });
  },

  onChangeNowAge(event) {
    this.setState({
      nowAge: event.target.value,
    });
  },

  render() {
    if (!this.state) {
      return <p>ohno</p>;
    } else {
      return (
        <div>
				<p>name:{this.state.data.name}</p>
				<p>age:{this.state.data.age}</p>
				<p>status:{this.state.message}</p>
				name:<input type="text" value={this.state.nowName}onChange={this.onChangeNowName}/>
				age :<input type="text" value={this.state.nowAge}onChange={this.onChangeNowAge}/>
				<button onClick={this.postData}>Post</button>
				</div>

        );
    }
  },



});
export default PostData ;
