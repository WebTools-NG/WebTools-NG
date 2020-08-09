import axios from 'axios';
import router from '../../router'
import {wtconfig} from '../../wtutils'

const log = require('electron-log');

const state = {
  plexServers: [],
  selectedServer: 'none',
  selectedServerAddress: '',
  selectedServerToken: '',
  authenticated: false,
  authToken: '',
  avatar: '',
  plexname: '',
  filteredProducts: []
};

const mutations = {
  UPDATE_PLEX_SERVERS(state, payload) {
    state.plexServers = payload;
  },
  UPDATE_SELECTED_SERVER(state, value) {
      state.selectedServer = value
      state.selectedServerToken = value.accessToken 
  },
  UPDATE_SELECTED_SERVER_ADDRESS(state, value) {
    state.selectedServerAddress = value
    log.info('UPDATE_SELECTED_SERVER_ADDRESS: ' + value)
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
      axios({
          method: 'get',
          url: 'https://plex.tv/api/v2/resources',
          responseType: 'json',
          headers: 
          {            
            'X-Plex-Client-Identifier' : 'WebTools-NG',
            'X-Plex-Token': getters.getAuthToken,
            'Accept' : 'application/json'
          },
          params: {
            'includeHttps' : '1',
            'includeRelay': '0'
          }
        })
          .then((response) => {
            let result=[];
            log.info('Response from fetchPlexServers recieved')
            const showNotOwned = wtconfig.get('Developer.showNotOwned', false)
            response.data.forEach((req) => {
              if (showNotOwned){
                if (req.product == "Plex Media Server") {
                  let pmsServer = {};
                  pmsServer['name'] = req.name;
                  pmsServer['accessToken'] = req.accessToken;
                  pmsServer['connections'] = req.connections;
                  pmsServer['clientIdentifier'] = req.clientIdentifier                                  
                  log.warn('fetchPlexServers : ser ikke owned')                  
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
    axios({
      method: 'POST',
      url: 'https://plex.tv/users/sign_in.json',
      responseType: 'json',
      auth: {
        username : payload.username,
        password:  payload.password
      },
      headers: 
      { 'X-Plex-Product' : 'webtools',
        'X-Plex-Version' : '1.19.2',
        'X-Plex-Client-Identifier' : 'WebTools-NG',
      }
    })  
      .then(function (response) {
        log.info('loginToPlex: Response from fetchPlexServers recieved')
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
          log.error('loginToPlex: ' + error.response.status)
          log.error('loginToPlex: ' + error.response.data)
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
  }
};

const getters = {
    getPlexServers: state => state.plexServers,
    getAuthToken: state => state.authToken,
    getAvatar: state => state.avatar,
    getPlexName: state => state.plexname,
    getSelectedServer: state => state.selectedServer,
    getSlectedServerAddress: state => state.selectedServerAddress,
    getSlectedServerToken: state => state.selectedServerToken
,
};

const serverModule = {
  state,
  mutations,
  actions,
  getters
}

export default serverModule;