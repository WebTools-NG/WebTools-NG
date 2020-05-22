import Vue from 'vue'
import Vuex from 'vuex'
import VuexPersistence from 'vuex-persist';
import plextv from './modules/plextv'

Vue.use(Vuex)

const vuexLocal = new VuexPersistence({
  storage: window.sessionStorage,
});


export default new Vuex.Store({
  state: {
    /*
    authenticated: false,
    authToken: ''
    */
  },
  mutations: {
    /*
    setAuthentication(state, status) {
      state.authenticated = status;
    },
    setAuthToken(state, token){
      state.authToken = token
    }
    */
  },
  getters: {
  },
  actions: {
  },
  modules: {
    plextv

  },
  plugins: [vuexLocal.plugin]
})
