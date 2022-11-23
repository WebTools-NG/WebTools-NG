const log = require('electron-log');
console.log = log.log;

import { wtconfig } from '../../components/modules/General/wtutils';

const state = {
    queue:{}
};

const mutations = {
    UPDATE_Queue(state) {
      state.queue = wtconfig.get('Download.Queue');
    }
  };


const getters = {
    getQueue: state => state.queue
};

const downloadQueue = {
  state,
  mutations,
  getters
}

export default downloadQueue;