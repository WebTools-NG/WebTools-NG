import axios from 'axios';
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
        var baseURL = getters.getSlectedServerAddress
        var accessToken = getters.getSlectedServerToken        
        commit('UPDATE_SECTIONS', await et.getSections(baseURL, accessToken))        
    },
    //getMediaMovies({ getters, commit }) {
    exportMedias({ commit, getters }) {

        //const testimp3 = require('../../components/modules/ExportTools/Samples/testimp3.json')
        
        // Vars OK
        var baseURL = getters.getSlectedServerAddress
        var accessToken = getters.getSlectedServerToken
        var libType = getters.getLibType
        var levelName = et.getLevelDisplayName(getters.getSelectedExportLevel, libType)        
              
        var key = getters.getSelectedSection
        
        var mediaSize = ''
        var calcSize = 0

       // var sections = getters.getPmsSections

        
        var libName = et.getLibDisplayName(getters.getSelectedSection, getters.getPmsSections)
                          

        libName, levelName, libType, 'xlsx', baseURL, accessToken
        excel2

        //excel2.createOutFile( libName, levelName, libType, 'xlsx', testimp3, baseURL, accessToken );



        axios, commit, key, mediaSize, calcSize
        /* 
        axios({
            method: 'get',
            baseURL: `${baseURL}`,
            url: `/library/sections/${key}/all`,
            responseType: 'json',
            headers: {
                'Accept':       "application/json",
                'X-Plex-Token': getters.getSlectedServerToken
            },
            params: {
                "type": "1",
                "X-Plex-Container-Start": "0",
                "X-Plex-Container-Size": "0"
            }
        }).then((response) => {
            mediaSize = response.data.MediaContainer.totalSize;
            calcSize = Math.ceil(mediaSize/30)
            log.info('calcSize is: ' + calcSize)

            for (let i = 0; i <= calcSize; i++) {
                axios({
                    method: 'get',
                    baseURL: `${baseURL}`,
                    url: `/library/sections/${key}/all`,
                    responseType: 'json',
                    headers: {
                        'Accept':       "application/json",
                        'X-Plex-Token': getters.getSlectedServerToken
                    },
                    params: {
                        "type": "1",
                        "X-Plex-Container-Start":getters.getContainerSizeMovies * i,
                        "X-Plex-Container-Size": getters.getContainerSizeMovies
                    }
                }).then((response) => {
                    log.info("NUGGA Calc : I is: " + i + "calc is: " + getters.getContainerSizeMovies * i)
                    log.info(response.data.MediaContainer.Metadata)
                    //mediaArray.push(response.data.MediaContainer.Metadata)
                    
                    //excel2.createOutFile( libName, level, libType, 'xlsx', response.data.MediaContainer.Metadata, baseURL, getters.getSlectedServerToken );
                    


                    commit('UPDATE_MEDIADATA', response.data.MediaContainer.Metadata)
                }).catch((error) => {
                    if (error.response) {                  
                        // The request was made and tgite server responded with a status code
                        // that falls out of the range of 2xx
                        log.info(error.response.data)
                        log.info(error.response.status)
                        alert(error.response.data.error)
                        //this.danger(error.response.status, error.response.data.error);
                    } else if (error.request) {
                        // The request was made but no response was received
                        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
                        // http.ClientRequest in node.js
                        log.info(error.request);
                    } else {
                        // Something happened in setting up the request that triggered an Error
                        log.info('Error', error.message);
                    }
                }
            )
              }
        }) */
        excel2.createOutFile( {libName: libName, level: levelName, libType: libType, outType: 'xlsx', baseURL: baseURL, accessToken: accessToken} );
        //excel2.createOutFile( libName, levelName, libType, 'xlsx', getters.getMediaMovies, baseURL, accessToken );       
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