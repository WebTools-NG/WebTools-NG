import axios from 'axios';
import router from '../../router'
import {wtconfig, wtutils} from '../../components/modules/General/wtutils'

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
  plexname: ''  
};

const mutations = {
  UPDATE_PLEX_SELECTED_SERVER_STATUS(state, payload) {
    state.selectedServerAddressUpdateInProgress = payload;
  },
  UPDATE_PLEX_SERVERS(state, payload) {
    state.plexServers = payload;
  },
  UPDATE_SELECTED_SERVER(state, value) {
      state.selectedServer = value
      state.selectedServerToken = value.accessToken 
  },
  UPDATE_SELECTED_SERVER_ADDRESS(state, value) {
    state.selectedServerAddress = value    
  },
  UPDATE_AUTHENTICATED(state, value){
    state.authenticated = value
  },
  UPDATE_AUTHTOKEN(state, value){
    state.authToken = value
  },
  UPDATE_AVATAR(state, value){
    state.avatar = value
  },
  UPDATE_PLEXNAME(state, value){
    state.plexname = value
  }
};

const actions = {
  fetchPlexServers({ commit, getters }) {
    let header = wtutils.PMSHeader;
    header['X-Plex-Token'] = getters.getAuthToken;
      

      axios({
          method: 'get',
          url: 'https://plex.tv/api/v2/resources',          
          headers: header,
          params: {
            'includeHttps' : '1',
            'includeRelay': '0'
          }
        })
          .then((response) => {
            let result=[];
            log.debug('Response from fetchPlexServers recieved')
            const showNotOwned = wtconfig.get('Developer.showNotOwned', false)
            response.data.forEach((req) => {
              if (showNotOwned){
                if (req.product == "Plex Media Server") {
                  let pmsServer = {};
                  pmsServer['name'] = req.name;
                  pmsServer['accessToken'] = req.accessToken;
                  pmsServer['connections'] = req.connections;
                  pmsServer['clientIdentifier'] = req.clientIdentifier                                  
                  log.debug('fetchPlexServers : See not owned servers as well')                  
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
            commit('UPDATE_PLEX_SERVERS', result)
          })
          .catch(function (error) {
            if (error.response) {                  
                log.error('fetchPlexServers: ' + error.response.data)
                alert(error.response.data.errors[0].code + " " + error.response.data.errors[0].message)
            } else if (error.request) {
                log.error('fetchPlexServers: ' + error.request)

            } else {
                log.error('fetchPlexServers: ' + error.message)
     }    
   });
  },
  loginToPlex({ commit }, payload){    
    log.info("loginToPlex called")
    var url = 'https://plex.tv/api/v2/users/signin';
    url = url + '?login=' + payload.username;
    url = url + '&password=' + payload.password;
    if ( payload.twoFA ){
      url = url + '&verificationCode=' + payload.twoFA
    }    
    axios({
      method: 'POST',
      url: url,      
      headers: wtutils.PMSHeader      
    })  
      .then(function (response) {
        log.debug('loginToPlex: Response from fetchPlexServers recieved')        
        commit('UPDATE_AUTHTOKEN', response.data.authToken)
        commit('UPDATE_AUTHENTICATED', true)
        commit('UPDATE_AVATAR', response.data.thumb)
        commit('UPDATE_PLEXNAME', response.data.username)
        router.replace({name: "home"});
    })
      .catch(function (error) {
         if (error.response) {                  
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          log.error('loginToPlex: ' + error.response.status);
          log.error('loginToPlex: ' + JSON.stringify(error.response.data));
          alert(error.response.data.error)
          //this.danger(error.response.status, error.response.data.error);
        } else if (error.request) {
          // The request was made but no response was received
          // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
          // http.ClientRequest in node.js
          log.error('loginToPlex: ' + error.request)
        } else {
          // Something happened in setting up the request that triggered an Error
          log.error('loginToPlex: ' + error.message)
        }})
  },
  loginToPlexWithToken({ commit }, payload){    
    log.info("loginToPlex called, using a Token")
    const url = 'https://plex.tv/users/sign_in.json?X-Plex-Token=' + payload.token;    
    axios({
      method: 'POST',
      url: url,
      headers: wtutils.PMSHeader      
    })  
      .then(function (response) {
        log.debug('loginToPlex: Response from fetchPlexServers recieved')
        commit('UPDATE_AUTHTOKEN', response.data.user.authToken)
        commit('UPDATE_AUTHENTICATED', true)
        commit('UPDATE_AVATAR', response.data.user.thumb)
        commit('UPDATE_PLEXNAME', response.data.user.username)
        router.replace({name: "home"}); 
    })
      .catch(function (error) {
         if (error.response) {                  
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          log.error('loginToPlex: ' + error.response.status);
          log.error('loginToPlex: ' + JSON.stringify(error.response.data));
          alert(error.response.data.error)
          //this.danger(error.response.status, error.response.data.error);
        } else if (error.request) {
          // The request was made but no response was received
          // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
          // http.ClientRequest in node.js
          log.error('loginToPlex: ' + error.request)
        } else {
          // Something happened in setting up the request that triggered an Error
          log.error('loginToPlex: ' + error.message)
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
    getSelectedServer: state => state.selectedServer,
    getSelectedServerAddress: state => state.selectedServerAddress,
    getSelectedServerAddressUpdateInProgress: state => state.selectedServerAddressUpdateInProgress,
    getSelectedServerToken: state => state.selectedServerToken
,
};

const serverModule = {
  state,
  mutations,
  actions,
  getters
}

export default serverModule;