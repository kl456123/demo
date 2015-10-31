import flux from 'control';
import {createStore, bind} from 'alt/utils/decorators';
import actions from 'actions/basicActions';

// 注意这个decorator把类变成了对象。
@createStore(flux)
class BasicStore {
  constructor(){
  }

  @bind(actions.updateABasic)
  updateABasic(info) {
    this.info = info;
    this.errorMessage = null;
  }

  @bind(actions.fetchABasic)
  fetchABasic() {
    this.info = null;
  }
}

export default BasicStore;
