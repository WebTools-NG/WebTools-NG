import {et, excel2} from '../../components/modules/ExportTools/scripts/et'

const log = require('electron-log');
console.log = log.log;

const state = {
    sections:   [],
    selectedSection : "",
    selectedExportLevel: "",
    selectedLibType: "",
    selectedPListType: "",
    exportStatus: {},
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
    UPDATE_EXPORTSTATUS(state, payload) {
      state.exportStatus1 = payload
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
    },
    exportMedias({ getters }) {
        var baseURL = getters.getSelectedServerAddress;
        var accessToken = getters.getSelectedServerToken;
        var libType = getters.getLibType;
        var pListType = getters.getSelectedLibTypeSec;
        let levelName;
        var libName = et.getLibDisplayName(getters.getSelectedSection, getters.getPmsSections);
        if ([ et.ETmediaType.Libraries, et.ETmediaType.Playlists].indexOf(libType) > -1)
        {
          levelName = 'All'
        }
        else
        {
          levelName = et.getLevelDisplayName(getters.getSelectedExportLevel, libType);
        }
        excel2.createOutFile( {
          libName: libName,
          level: levelName,
          libType: libType,
          baseURL: baseURL,
          accessToken: accessToken,
          exType: libType,
          pListType: pListType,
          libTypeSec: getters.getSelectedLibTypeSec
        } );
    }
}

const getters = {
    getPmsSections: state => state.sections,
    getSelectedSection: state => state.selectedSection,
    getSelectedExportLevel: state => state.selectedExportLevel,
    getLibType: state  => state.selectedLibType,
    getExportLevels: state => state.exportLevels,
    getExportStatus: state => state.exportStatus,
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