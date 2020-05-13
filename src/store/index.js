import Vue from 'vue'
import Vuex from 'vuex'
import VuexPersistence from 'vuex-persist';


Vue.use(Vuex)

const vuexLocal = new VuexPersistence({
  storage: window.localStorage,
});



export default new Vuex.Store({
  state: {
    authenticated: false
  },
  mutations: {
    setAuthentication(state, status) {
      state.authenticated = status;
    }
  },
  actions: {
  },
  modules: {
  },
  plugins: [vuexLocal.plugin]
})
