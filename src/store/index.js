import Vue from 'vue';
import Vuex from 'vuex';
import VuexPersistence from 'vuex-persist';
import plextv from './modules/plextv';
import poeditor from './modules/poeditor';
import et from './modules/et';
import language from './modules/language';
import pms from './modules/pms';

Vue.use(Vuex);

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
    et,
    language,
    pms
  },
  plugins: [vuexLocal.plugin]
})
