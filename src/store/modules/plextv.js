import axios from 'axios';
import router from '../../router'


const state = {
  plexServers: [],
  selectedServerId: '',
  authenticated: false,
  authToken: '',
  avatar: '',
  filteredProducts: []
};

const mutations = {
  UPDATE_PLEX_SERVERS(state, payload) {
    state.plexServers = payload;
  },
  UPDATE_SELECTED_SERVER(state, value) {
      state.selectedServerId = value
  },
  UPDATE_AUTHENTICATED(state, value){
    state.authenticated = value
  },
  UPDATE_AUTHTOKEN(state, value){
    state.authToken = value
  },
  UPDATE_AVATAR(state, value){
    state.avatar = value
  }
};

const actions = {
  fetchPlexServers({ commit, getters }) {
      axios({
          method: 'get',
          url: 'https://plex.tv/api/v2/resources?includeHttps=1&includeRelay=1',
          responseType: 'json',
          headers: 
          {            
            'X-Plex-Client-Identifier' : 'WebTools-NG',
            'X-Plex-Token': getters.getAuthToken,
            'Accept' : 'application/json'
          },
        })
          .then((response) => {
            let result=[];
          response.data.forEach((req) => {
          if (req.owned == true && req.product == "Plex Media Server") {
              result.push(req);
            } 
          })

          console.log(result)
            commit('UPDATE_PLEX_SERVERS', result)
          })
          .catch(function (error) {
            if (error.response) {                  
                console.log(error.response.data)
                alert(error.response.data.errors[0].code + " " + error.response.data.errors[0].message)
            } else if (error.request) {
                console.log(error.request);
            } else {
                console.log('Error', error.message);
     }    
   });
  },
  loginToPlex({ commit }, payload){
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
        console.log(response.data)
        console.log(response.status)
        commit('UPDATE_AUTHTOKEN', response.data.user.authToken)
        commit('UPDATE_AUTHENTICATED', true)
        commit('UPDATE_AVATAR', response.data.user.thumb)
        router.replace({name: "home"}); 
})
      .catch(function (error) {
         if (error.response) {                  
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.log(error.response.data)
          console.log(error.response.status)
          alert(error.response.data.error)
          //this.danger(error.response.status, error.response.data.error);
        } else if (error.request) {
          // The request was made but no response was received
          // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
          // http.ClientRequest in node.js
          console.log(error.request);
        } else {
          // Something happened in setting up the request that triggered an Error
          console.log('Error', error.message);
        }})
  }
};

const getters = {
    getPlexServers: state => state.plexServers,
    getAuthToken: state => state.authToken,
    getAvatar: state => state.avatar
};

const serverModule = {
  state,
  mutations,
  actions,
  getters
}

export default serverModule;