import Vue from 'vue'
import Vuex from 'vuex'
import VuexPersistence from 'vuex-persist';

Vue.use(Vuex)

const vuexLocal = new VuexPersistence({
  storage: window.sessionStorage,
});


export default new Vuex.Store({
  state: {
    authenticated: false,
    authToken: ''
  },
  mutations: {
    setAuthentication(state, status) {
      state.authenticated = status;
    },
    setAuthToken(state, token){
      state.authToken = token
    }
  },
  getters: {
  },
  actions: {
  },
  modules: {
  },
  plugins: [vuexLocal.plugin]
})
