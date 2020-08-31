import {excel2} from '../../components/modules/ExportTools/et'
import {et} from '../../components/modules/ExportTools/et'
const log = require('electron-log');

const state = {
    sections:   [],
    mediaData: [],
    selectedSection : "",
    selectedExportLevel: "",    
    selectedLibType: "",
    exportStatus: ""
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
      UPDATE_EXPORTLEVEL(state, payload) {
          state.selectedExportLevel = payload
      },
      UPDATE_EXPORTSTATUS(state, payload) {
        state.exportStatus = payload
      },          
      UPDATE_EXPORTLEVELS(state, payload) {
        state.exportLevels = payload
      },
      UPDATE_SELECTEDLIBTYPE(state, payload) {
        state.selectedLibType = payload
      },      
      UPDATE_MEDIADATA(state, payload) {
          state.mediaData.push(payload)
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
        var baseURL = getters.getSelectedServerAddress
        var accessToken = getters.getSelectedServerToken
        var libType = getters.getLibType
        var levelName = et.getLevelDisplayName(getters.getSelectedExportLevel, libType)                                  
        var libName = et.getLibDisplayName(getters.getSelectedSection, getters.getPmsSections)                                         
        excel2.createOutFile( {
          libName: libName, 
          level: levelName, 
          libType: libType, 
          baseURL: baseURL, 
          accessToken: accessToken
        } );        
    }
}

const getters = {
    getPmsSections: state => state.sections,
    getSelectedSection: state => state.selectedSection,    
    getSelectedExportLevel: state => state.selectedExportLevel,
    getLibType: state  => state.selectedLibType,
    getExportLevels: state => state.exportLevels,
    getExportStatus: state => state.exportStatus    
};

const etModule = {
  state,
  mutations,
  actions,
  getters
}

export default etModule;