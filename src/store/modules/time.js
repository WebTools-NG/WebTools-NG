const log = require('electron-log');
console.log = log.log;

const state = {
    startTime: '',
    endTime: ''
};

const mutations = {
    UPDATE_startTime(state, payload) {
      state.startTime = payload
    },
    UPDATE_endTime(state, payload) {
        state.endTime = payload
    }
  };


const getters = {
    getStartTime: state => state.startTime,
    getEndTime: state => state.endTime
};

const time = {
  state,
  mutations,
  getters
}

export default time;