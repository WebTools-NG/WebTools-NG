const log = require('electron-log');
console.log = log.log;

import { wtconfig } from '../../components/modules/General/wtutils';

const state = {
    queue:{},
    queueStatus: false
};

const mutations = {
    UPDATE_Queue(state) {
      state.queue = wtconfig.get('Download.Queue');
    },
    UPDATE_QueueStatus(state, payload) {
      state.queueStatus = payload;
    }
  };


const getters = {
    getQueue: state => state.queue,
    getQueueStatus: state => state.queueStatus
};

const downloadQueue = {
  state,
  mutations,
  getters
}

export default downloadQueue;