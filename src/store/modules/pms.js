import axios from 'axios';
import {wtconfig, wtutils} from '../../components/modules/General/wtutils';
import i18n from '../../i18n';

const log = require('electron-log');
const {JSONPath} = require('jsonpath-plus');

const state = {
    settings: {},
    DVRs: {},
    doneDVRBackup: ''
  };

const mutations = {
  UPDATE_PMS_SETTINGS(state, payload) {
    state.settings = payload;
  },
  UPDATE_DVR_SETTINGS(state, payload) {
    state.DVRs = payload;
  },
  UPDATE_doneDVRBackup(state, payload) {
    state.doneDVRBackup = payload;
  }
};

const getters = {
    getPMSSettings: state => state.settings,
    getDVRs: state => state.DVRs,
    doneDVRBackup: state => state.doneDVRBackup
}

const actions = {
  async startButlerTask({ commit }, payload) {

    commit

    let header = wtutils.PMSHeader;
    header['X-Plex-Token'] = payload.Token;
    const url = `${payload.Address}/butler/${payload.Job}`;
    log.debug(`Setting new setting with url ${url}`);
    await axios({
      method: 'post',
      url: url,
      headers: header
    })
    .then((response) => {
      log.debug('Response from startButlerTask recieved')
      response
    })
    .catch(function (error) {
      if (error.response) {
          log.error('startButlerTask: ' + error.response.data)
          alert(error.response.data.errors[0].code + " " + error.response.data.errors[0].message)
      } else if (error.request) {
          log.error('startButlerTask: ' + error.request)
      } else {
          log.error('startButlerTask: ' + error.message)
      }
    });

  },
  async setPMSSetting({ commit }, payload) {

    commit

    let header = wtutils.PMSHeader;
    header['X-Plex-Token'] = payload.Token;
    const url = `${payload.Address}/:/prefs?${payload.Setting}=${payload.Value}`;
    log.debug(`Setting new setting with url ${url}`);
    await axios({
      method: 'put',
      url: url,
      headers: header
    })
    .then((response) => {
      log.debug('Response from setPMSSetting recieved')
      response
    })
    .catch(function (error) {
      if (error.response) {
          log.error('setPMSSetting: ' + error.response.data)
          alert(error.response.data.errors[0].code + " " + error.response.data.errors[0].message)
      } else if (error.request) {
          log.error('setPMSSetting: ' + error.request)
      } else {
          log.error('setPMSSetting: ' + error.message)
      }
    });

  },
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
            // Filtered result based on hidden, adv or all
            var curFilter = wtconfig.get('PMS.FilterSetting', 'AllSettings');
            log.verbose(`Filter set to ${curFilter}`);
            if (curFilter == 'AllSettings'){
              filteredResult = JSONPath({path: '$..Setting', json: response.data})[0];
            }
            else if (curFilter == 'OnlyHidden'){
              filteredResult = JSONPath({path: '$..Setting[?(@.hidden==true)]', json: response.data});
            }
            else {
              filteredResult = JSONPath({path: '$..Setting[?(@.advanced==true)]', json: response.data});
            }
            // Reset PMSSettings
            var PMSSettings = {};
            // Create Array for undefined
            PMSSettings[i18n.t('Modules.PMS.Settings.Undefined')] = [];
            // Create Arrays for other categories
            filteredResult.forEach(group => {
              group = JSONPath({path: '$.group', json: group})[0]
              if (group !== "") {
                  PMSSettings[group] = [];
              }
            })
            // Get the single items
            filteredResult.forEach(element => {
              var id = JSONPath({path: '$.id', json: element});
              var itemGroup = JSONPath({path: '$.group', json: element});
              if (itemGroup == "")
              {
                itemGroup = i18n.t('Modules.PMS.Settings.Undefined');
              }
              var PMSSettingsItem = {}
              var jNode = {};
              jNode['label'] = JSONPath({path: '$.label', json: element})[0];
              jNode['summary'] = JSONPath({path: '$.summary', json: element})[0];
              jNode['type'] = JSONPath({path: '$.type', json: element})[0];
              jNode['default'] = JSONPath({path: '$.default', json: element})[0];
              jNode['value'] = JSONPath({path: '$.value', json: element})[0];
              PMSSettingsItem[id] = jNode;
              PMSSettings[itemGroup].push(PMSSettingsItem);
            });
            // Remove undefined category, if empty
            if (Object.keys(PMSSettings[i18n.t('Modules.PMS.Settings.Undefined')]).length === 0){
              delete PMSSettings[i18n.t('Modules.PMS.Settings.Undefined')];
            }
            log.verbose(`PMS Settings are: ${JSON.stringify(PMSSettings)}`);
            // Workaround for issue #429
            if ( !JSON.stringify(PMSSettings).includes('LogNumFiles') )
            {
              // Put into undefined, since the only one we know the name of
              var itemGroup = i18n.t('Modules.PMS.Settings.Undefined');
              var PMSSettingsItem = {}
              var jNode = {};
              jNode['label'] = 'Amount of log files';
              jNode['summary'] = 'Amount of log files to keep before rolling over. Server must be restarted for changes to take effect';
              jNode['type'] = 'int';
              jNode['default'] = 5;
              jNode['value'] = 5;
              PMSSettingsItem['LogNumFiles'] = jNode;
              PMSSettings[itemGroup].push(PMSSettingsItem);
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