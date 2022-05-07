const log = require('electron-log');
console.log = log.log;

const state = {
    Status: ''
};

const mutations = {
    UPDATE_Status(state, payload) {
      state.Status = payload
    }
  };


const getters = {
    getStatus: state => state.Status
};

const statusModule = {
  state,
  mutations,
  getters
}

export default statusModule;