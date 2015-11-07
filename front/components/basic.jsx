import React from 'react';
import connectToStores from 'alt/utils/connectToStores';
import store from 'stores/basicStore';
import action from 'actions/basicActions';

@connectToStores
class Basic extends React.Component {
  // this two is used for connecting to store
  static getStores() {
    return [store];
  }
  static getPropsFromStores() {
    return store.getState();
  }
  constructor(props) {
    super(props);
    this.state = {};
  }
  componentDidMount() {
    store.listen(this.onChange);
    action.fetchABasic();
  }
  componentWillUnmount() {
    store.unlisten(this.onChange);
  }
  onChange = state=>{
    this.setState(state)
  }

  render() {
    if(!this.state.info){
      return <div>waiting!!! fetching!!</div>;
    }
    if(this.state.info){
      let info = this.state.info;
      return (
	<div class="container">
	<a href="/list/basic">返回列表</a>
	<div class="row">
        <h3 class="page-header">{info.title}</h3>
        <div class="row">
        <div class="col-md-6">
        <img src={info.cover} alt={info.title} />
        </div>
        <div class="col-md-6">
        <p>名称：{info.title}</p>
        <p>编号：{info.number}</p>
        </div>
        </div>
	</div>
	<div>
        <h3 class="page-header">详情</h3>
        <p id="basic-detail"></p>
	</div>
	</div>
      );
    }
  }
}

export default Basic;
