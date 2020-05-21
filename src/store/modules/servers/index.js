import axios from 'axios';
import mstore from '../../index';


const state = {
  plexServers: [],
  selectedServerId: ''
};

const mutations = {
  UPDATE_PLEX_SERVERS(state, payload) {
    state.plexServers = payload;
  },
  UPDATE_SELECTED_SERVER(state, value) {
      state.selectedServerId = value
  }
};

const actions = {
  getPlexServers({ commit }) {
      axios({
          method: 'get',
          url: 'https://plex.tv/api/v2/resources',
          headers: 
          {
            'includeHttps' : '1',
            'includeRelay' : '1',
            'X-Plex-Client-Identifier' : 'WebTools-NG',
            'X-Plex-Token': mstore.getters.getAuthToken
          },
        })
          .then((response) => {
            commit('UPDATE_PLEX_SERVERS', response.data)
          })
          .catch(function (error) {
            if (error.response) {                  
                console.log(error.response.data)
                console.log(error.response.status)
                alert(error.response.data.error)
            } else if (error.request) {
                console.log(error.request);
            } else {
                console.log('Error', error.message);
     }    
   });
  }
};

const getters = {
    plexServers: state => state.plexServers
};

const serverModule = {
  state,
  mutations,
  actions,
  getters
}

export default serverModule;