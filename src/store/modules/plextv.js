import axios from 'axios';
import router from '../../router'
import {wtconfig, wtutils} from '../../components/modules/General/wtutils'
import i18n from '../../i18n';

const log = require('electron-log');

const state = {
  plexServers: [],
  selectedServer: 'none',
  selectedServerAddress: '',
  selectedServerAddressUpdateInProgress: false,
  selectedServerToken: '',
  authenticated: false,
  authToken: '',
  avatar: '',
  plexname: '',
  users: {},
  MeId: ''
};

const mutations = {
  UPDATE_PLEX_SELECTED_SERVER_STATUS(state, payload) {
    state.selectedServerAddressUpdateInProgress = payload;
  },
  UPDATE_PLEX_SERVERS(state, payload) {
    state.plexServers = payload;
  },
  UPDATE_SELECTED_SERVER(state, value) {
      state.selectedServer = value;
      state.selectedServerToken = value.accessToken;
  },
  UPDATE_SELECTED_SERVER_ADDRESS(state, value) {
    state.selectedServerAddress = value;
  },
  UPDATE_AUTHENTICATED(state, value){
    state.authenticated = value;
  },
  UPDATE_AUTHTOKEN(state, value){
    state.authToken = value;
  },
  UPDATE_AVATAR(state, value){
    state.avatar = value;
  },
  UPDATE_PLEXNAME(state, value){
    state.plexname = value;
  },
  UPDATE_MeId(state, value){
    state.MeId = value;
  },
  UPDATE_USERS(state, value){
    state.users = value;
  },
  UPDATE_Features(state, value){
    state.features = value;
  }
};

const actions = {
  async fetchUsers( { commit, getters }){
    log.debug('Getting users from plex.tv');
    let header = wtutils.PMSHeader;
    header['X-Plex-Token'] = getters.getAuthToken;
    await axios({
      method: 'get',
      url: `${wtutils.plexTVApi}v2/friends`,
      headers: header
    })
      .then((response) => {
        const ptvusers = {};
        log.debug('Response from fetchUsers recieved');
        response.data.forEach((req) => {
          ptvusers[req.id] = req;
        })
        commit('UPDATE_USERS', ptvusers);
        log.verbose('Users added to store')
      })
      .catch(function (error) {
        if (error.response) {
            log.error('fetchUsers: ' + error.response.data);
            alert(error.response.data.errors[0].code + " " + error.response.data.errors[0].message);
        } else if (error.request) {
            log.error('fetchUsers: ' + error.request);
        } else {
            log.error('fetchUsers: ' + error.message);
      }
    });
  },
  fetchPlexServers({ commit, getters }) {
    let header = wtutils.PMSHeader;
    header['X-Plex-Token'] = getters.getAuthToken;
      axios({
          method: 'get',
          url: `${wtutils.plexTVApi}v2/resources`,
          headers: header,
          params: {
            'includeHttps' : '1',
            'includeRelay': '0'
          }
        })
          .then((response) => {
            let result=[];
            log.debug('[plextv.js] (fetchPlexServers) Response from fetchPlexServers recieved');
            const showNotOwned = wtconfig.get('Developer.showNotOwned', false);
            if (showNotOwned){
              log.debug('[plextv.js] (fetchPlexServers) fetchPlexServers : See not owned servers as well');
            }
            response.data.forEach((req) => {
              if (showNotOwned){
                if (req.product == "Plex Media Server") {
                  let pmsServer = {};
                  pmsServer['name'] = req.name;
                  pmsServer['accessToken'] = req.accessToken;
                  pmsServer['connections'] = req.connections;
                  pmsServer['clientIdentifier'] = req.clientIdentifier;
                  result.push(pmsServer);
                }
              } else {
                if (req.owned == true && req.product == "Plex Media Server") {
                  let pmsServer = {};
                  pmsServer['name'] = req.name;
                  pmsServer['accessToken'] = req.accessToken;
                  pmsServer['connections'] = req.connections;
                  pmsServer['clientIdentifier'] = req.clientIdentifier
                  result.push(pmsServer);
                }
              }
            })
            commit('UPDATE_PLEX_SERVERS', result);
          })
          .catch(function (error) {
            if (error.response) {
                log.error('fetchPlexServers: ' + error.response.data);
                alert(error.response.data.errors[0].code + " " + error.response.data.errors[0].message);
            } else if (error.request) {
                log.error('fetchPlexServers: ' + error.request);
            } else {
                log.error('fetchPlexServers: ' + error.message);
     }
   });
  },
  loginToPlex({ commit }, payload){
    log.info("[plextv.js] (loginToPlex) loginToPlex called")
    var url = `${wtutils.plexTVApi}v2/users/signin`;
    url = url + '?login=' + require('querystring').escape(payload.username);
    url = url + '&password=' + require('querystring').escape(payload.password);
    if ( payload.twoFA ){
      url = url + '&verificationCode=' + payload.twoFA
    }
    axios({
      method: 'POST',
      url: url,
      headers: wtutils.PMSHeader
    })
      .then(function (response) {
        log.debug('[plextv.js] (loginToPlex) loginToPlex: Response from fetchPlexServers recieved')
        commit('UPDATE_AUTHTOKEN', response.data.authToken)
        commit('UPDATE_AUTHENTICATED', true)
        commit('UPDATE_AVATAR', response.data.thumb)
        commit('UPDATE_PLEXNAME', response.data.username)
        commit('UPDATE_MeId', response.data.user.id);
        commit('UPDATE_Features', response.data.user.subscription.features);
        router.replace({name: "home"});
    })
      .catch(function (error) {
         if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          log.error(`[plextv.js] (loginToPlex) status: ${error.response.status}`);
          log.error(`[plextv.js] (loginToPlex) data: ${JSON.stringify(error.response.data)}`);
          // alert(error.response.data.message)
          var data = JSON.stringify(error.response.data);
          var objectValue = JSON.parse(data);
          var statusCode = JSON.stringify(objectValue.errors[0].code);
          log.error(`[plextv.js] (loginToPlex) statusCode: ${statusCode}`);
          if (statusCode == 1029)
          {
            log.error('[plextv.js] (loginToPlex) Missing 2FA code');
            alert(i18n.t('Common.Login.Missing2FACode'))
          }
        } else if (error.request) {
          // The request was made but no response was received
          // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
          // http.ClientRequest in node.js
          log.error('[plextv.js] (loginToPlex) Could not connect to plex.tv');
          alert(i18n.t('Common.Login.LoginConnectErr'));
        } else {
          // Something happened in setting up the request that triggered an Error
          log.error(`[plextv.js] (loginToPlex) ${error.message}`)
        }})
  },
  loginToPlexWithToken({ commit }, payload){
    log.info("[plextv.js] (loginToPlexWithToken) loginToPlex called, using a Token")
    let header = wtutils.PMSHeader;
    const url = 'https://plex.tv/users/sign_in.json?X-Plex-Token=' + payload.token;
    axios({
      method: 'POST',
      url: url,
      headers: header
    })
      .then(function (response) {
        log.debug(`[plextv.js] (loginToPlexWithToken) - Response recieved`);
        commit('UPDATE_AUTHTOKEN', response.data.user.authToken);
        commit('UPDATE_AUTHENTICATED', true);
        commit('UPDATE_AVATAR', response.data.user.thumb);
        commit('UPDATE_PLEXNAME', response.data.user.username);
        commit('UPDATE_MeId', response.data.user.id);
        commit('UPDATE_Features', response.data.user.subscription.features);
        router.replace({name: "home"});
    })
      .catch(function (error) {
         if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          log.error('[plextv.js] (loginToPlexWithToken) loginToPlexToken1: ' + error.response.status);
          log.error('[plextv.js] (loginToPlexWithToken) loginToPlexToken2: ' + JSON.stringify(error.response.data));
          alert(error.response.data.error)
          //this.danger(error.response.status, error.response.data.error);
        } else if (error.request) {
          // The request was made but no response was received
          // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
          // http.ClientRequest in node.js
          // log.error('loginToPlexToken3: ' + JSON.stringify(error.request));
          log.error('[plextv.js] (loginToPlexWithToken) Could not connect to plex.tv with a Token');
          alert(i18n.t('Common.Login.LoginConnectErrToken'));
        } else {
          // Something happened in setting up the request that triggered an Error
          log.error('[plextv.js] (loginToPlexWithToken) loginToPlexToken4: ' + error.message)
        }})
  },
  updatingServerAddress({ commit}, status){
    commit('UPDATE_PLEX_SELECTED_SERVER_STATUS', status)
  }
};

const getters = {
    getPlexServers: state => state.plexServers,
    getAuthToken: state => state.authToken,
    getAvatar: state => state.avatar,
    getPlexName: state => state.plexname,
    getMeId: state => state.MeId,
    getSelectedServer: state => state.selectedServer,
    getSelectedServerAddress: state => state.selectedServerAddress,
    getSelectedServerAddressUpdateInProgress: state => state.selectedServerAddressUpdateInProgress,
    getSelectedServerToken: state => state.selectedServerToken,
    getUsers: state => state.users,
    getFeatures: state => state.features
,
};

const serverModule = {
  state,
  mutations,
  actions,
  getters
}

export default serverModule;