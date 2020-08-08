// mutation.js
//import {App} from '../../main'
import i18n from '../../i18n'
const log = require('electron-log');

export const mutations = {
  SET_LANG (state, payload) {
    //App.$i18n.locale = payload
    i18n.locale = payload
  }
}
export const actions = {
  setLang({commit}, payload) {
      log.info(`Set lang to: ${JSON.stringify(payload)}`)
    commit('SET_LANG', payload)
  }
}

const serverModule = {
    //state,
    mutations,
    actions,
    //getters
  }
  
  export default serverModule;