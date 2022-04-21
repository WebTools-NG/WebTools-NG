//import { etHelper } from '../../components/modules/ExportTools/scripts/ethelper'

const log = require('electron-log');
console.log = log.log;

const state = {
    viewStateStatus: ''
};

const mutations = {
    UPDATE_viewStateStatus(state, payload) {
      state.viewStateStatus = payload
    }
  };


const getters = {
    getViewStateStatus: state => state.viewStateStatus
};

const viewstateModule = {
  state,
  mutations,
  getters
}

export default viewstateModule;