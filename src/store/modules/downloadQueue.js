const log = require('electron-log');
console.log = log.log;

import { wtconfig } from '../../components/modules/General/wtutils';

const state = {
    queue:{},
    queueStatus: false,
    serversFound: null,
    serverSelected: null,
    librariesFound: null,
    librarySelected: null,
    vListCompleted: false,
    vList: null,
    serversUpdated: null,
    srvBaseAddress: null
};

const mutations = {
    UPDATE_Queue(state) {
      state.queue = wtconfig.get('Download.Queue');
    },
    UPDATE_QueueStatus(state, payload) {
      state.queueStatus = payload;
    },
    UPDATE_ServersFound(state, payload) {
      state.serversFound = payload;
    },
    UPDATE_ServerSelected(state, payload) {
      state.serverSelected = payload;
    },
    UPDATE_LibrariesFound(state, payload) {
      state.librariesFound = payload;
    },
    UPDATE_LibrarySelected(state, payload) {
      state.librarySelected = payload;
    },
    UPDATE_VListCompleted(state, payload) {
      state.vListCompleted = payload;
    },
    UPDATE_VList(state, payload) {
      state.vList = payload;
    },
    UPDATE_ServersUpdated(state, payload) {
      state.serversUpdated = payload;
    },
    UPDATE_SrvBaseAddress(state, payload) {
      state.srvBaseAddress = payload;
    },
  };

const getters = {
    getQueue: state => state.queue,
    getQueueStatus: state => state.queueStatus,
    getServersFound: state => state.serversFound,
    getServerSelected: state => state.serverSelected,
    getLibrariesFound: state => state.librariesFound,
    getLibrarySelected: state => state.librarySelected,
    getVListCompleted: state => state.vListCompleted,
    getVList: state => state.vList,
    getServersUpdated: state => state.serversUpdated,
    getSrvBaseAddress: state => state.srvBaseAddress
};

const downloadQueue = {
  state,
  mutations,
  getters
}

export default downloadQueue;