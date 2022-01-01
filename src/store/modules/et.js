//import {et, excel2} from '../../components/modules/ExportTools/scripts/et'
import {et} from '../../components/modules/ExportTools/scripts/et'
//import { etHelper } from '../../components/modules/ExportTools/scripts/ethelper'

const log = require('electron-log');
console.log = log.log;

const state = {
    sections:   [],
    selectedSection : "",
    selectedExportLevel: "",
    selectedLibType: "",
    selectedPListType: "",
    ETStatus: ''
};

const mutations = {
    UPDATE_SECTIONS(state, payload) {
        state.sections = payload;
        log.info("UPDATE_SECTIONS called")
    },
    UPDATE_SELECTEDSECTION(state, payload) {
        state.selectedSection = payload
        log.info("UPDATE_SELECTEDSECTION called")
    },
    UPDATE_SELECTEDPLISTTYPE(state, payload) {
      state.selectedPListType = payload
      log.info("UPDATE_SELECTEDPLISTTYPE called")
    },
    UPDATE_EXPORTLEVEL(state, payload) {
        state.selectedExportLevel = payload
    },
    UPDATE_EXPORTLEVELS(state, payload) {
      state.exportLevels = payload
    },
    UPDATE_SELECTEDLIBTYPE(state, payload) {
      state.selectedLibType = payload
    },
    UPDATE_SELECTEDLIBTYPESEC(state, payload) {
      state.selectedLibTypeSec = payload
    },
    UPDATE_SELECTEDETStatus(state, payload) {
      state.ETStatus = payload
    }
  };

const actions = {
  async fetchSections({ commit, getters }) {
      log.info("fetchSections called")
      var baseURL = getters.getSelectedServerAddress
      var accessToken = getters.getSelectedServerToken
      commit('UPDATE_SECTIONS', await et.getSections(baseURL, accessToken))
  }
}

const getters = {
    getPmsSections: state => state.sections,
    getSelectedSection: state => state.selectedSection,
    getSelectedExportLevel: state => state.selectedExportLevel,
    getLibType: state  => state.selectedLibType,
    getExportLevels: state => state.exportLevels,
    getSelectedPListType: state => state.selectedPListType,
    getSelectedLibTypeSec: state => state.selectedLibTypeSec,
    getETStatus: state => state.ETStatus
};

const etModule = {
  state,
  mutations,
  actions,
  getters
}

export default etModule;