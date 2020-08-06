import Vue from 'vue'
import Vuex from 'vuex'
import VuexPersistence from 'vuex-persist';
import plextv from './modules/plextv'
import poeditor from './modules/poeditor'
import et from './modules/et'

Vue.use(Vuex)

const vuexLocal = new VuexPersistence({
  storage: window.sessionStorage,
});


export default new Vuex.Store({
  state: {
  },
  mutations: {},
  getters: {    
  },
  actions: {},
  modules: {
    plextv,
    poeditor,
    et
  },
  plugins: [vuexLocal.plugin]
})
