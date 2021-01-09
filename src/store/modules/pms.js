import axios from 'axios';
import {wtconfig, wtutils} from '../../components/modules/General/wtutils';
import i18n from '../../i18n';

const log = require('electron-log');
const {JSONPath} = require('jsonpath-plus');

const state = {
    settings: {}     
  };

const mutations = {
    UPDATE_PMS_SETTINGS(state, payload) {
        state.settings = payload;
    }
};

const getters = {
    getPMSSettings: state => state.settings
}

const actions = {
    async fetchPMSSettings({ commit }, payload) {
        let header = wtutils.PMSHeader;
        header['X-Plex-Token'] = payload.Token;        
        const url = payload.Address + '/:/prefs';
        await axios({
                method: 'get',
                url: url,          
                headers: header
            })
            .then((response) => {             
              log.debug('Response from fetchPlexServers recieved')              
              var filteredResult = {}
              // filteredResult based on hidden or not
              if (wtconfig.get('PMS.OnlyHidden', true) == true){
                  log.debug('Show only Hidden settings')                  
                  filteredResult = JSONPath({path: '$..Setting[?(@.hidden==true)]', json: response.data});                  
              }
              else {
                log.debug('Show non-hidden settings as well')
                filteredResult = JSONPath({path: '$..Setting', json: response.data})[0];
              }              
              if (wtconfig.get('PMS.OnlyAdvanced', true) == true){
                log.debug('Show only OnlyAdvanced settings')
                filteredResult = JSONPath({path: '$.[?(@.advanced==true)]', json: filteredResult});                
              }
              else {
                log.debug('Show all settings');                
              }             
              var PMSSettings = {};
              PMSSettings[i18n.t('Modules.PMS.Settings.Undefined')] = {};              
              filteredResult.forEach(group => {
                group = JSONPath({path: '$.group', json: group})[0]                
                if (group !== "") {
                    PMSSettings[group] = {};
                }
              })              
              filteredResult.forEach(element => {
                var id = JSONPath({path: '$.id', json: element});
                var jNode = {};
                jNode['label'] = JSONPath({path: '$.label', json: element})[0];
                jNode['summary'] = JSONPath({path: '$.summary', json: element})[0];
                jNode['type'] = JSONPath({path: '$.type', json: element})[0];
                jNode['default'] = JSONPath({path: '$.default', json: element})[0];
                jNode['value'] = JSONPath({path: '$.value', json: element})[0];
                if (JSONPath({path: '$.group', json: element}) == ""){ 
                  log.debug('Ged: ' + i18n.t('Modules.PMS.Settings.Undefined'))

                    PMSSettings[i18n.t('Modules.PMS.Settings.Undefined')][id] = jNode;                    
                }
                else {                    
                    PMSSettings[JSONPath({path: '$.group', json: element})][id] = jNode;
                }
              });              
              // Remove undefined category, if empty
              if (Object.keys(PMSSettings[i18n.t('Modules.PMS.Settings.Undefined')]).length === 0){                  
                delete PMSSettings[i18n.t('Modules.PMS.Settings.Undefined')];
              }
              commit('UPDATE_PMS_SETTINGS', PMSSettings);
            })
            .catch(function (error) {
              if (error.response) {                  
                  log.error('fetchPMSSettings: ' + error.response.data)
                  alert(error.response.data.errors[0].code + " " + error.response.data.errors[0].message)
              } else if (error.request) {
                  log.error('fetchPMSSettings: ' + error.request)
              } else {
                  log.error('fetchPMSSettings: ' + error.message)
       }    
     });
    }
};



const serverModule = {
    state,
    mutations,
    actions,
    getters
};
  
export default serverModule;