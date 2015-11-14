import flux from 'control';
import {createActions} from 'alt/utils/decorators';
import api from 'apis/basicAPI'

// 注意这个decorator把类变成了对象。
@createActions(flux)
class BasicActions {
  constructor() {
  }
  fetchABasic(id) {
    // we dispatch an event here so we can have "loading" state.
    this.dispatch(id);
    api.fetch()
      .then((info) => {
        // we can access other actions within our action through `this.actions`
        this.actions.updateABasic(info);
      })
      .catch((errorMessage) => {
        this.actions.failedABasic(errorMessage);
      });
  }
  updateABasic(info) {
    this.dispatch(info);
  }
  failedABasic(errorMessage) {
    this.dispatch(errorMessage);
  }
}

export default BasicActions;
