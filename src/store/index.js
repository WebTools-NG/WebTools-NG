import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

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
  }
})
