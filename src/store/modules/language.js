// mutation.js

import i18n from '../../i18n'
import {wtutils, wtconfig} from '../../components/modules/General/wtutils'
import VueI18n from 'vue-i18n';
const log = require('electron-log');
console.log = log.log;

export const mutations = {
  SET_LANG (state, payload) {
    log.info(`Set language to: ${payload}`)
    VueI18n.locale = payload
    wtconfig.set('General.language', payload)
  }
}

export const actions = {
  async updateAndSetLang({commit}, { langCode, forceDownload }){
    const fs = require('fs')
    try {
      log.info(`Loading lang: ${JSON.stringify(langCode)}`)
      var langFile = wtutils.Home + '/locales/' + langCode + '.json'
      if (!fs.existsSync(langFile) | forceDownload) {
        // Do something
        log.debug(`Need to download language file for: ${langCode}`)
        await this.dispatch("forceDownload", { "langCode": langCode});
      }
      const res = await JSON.parse(fs.readFileSync(langFile, 'utf8'));
      i18n.setLocaleMessage(langCode, res)
      commit('SET_LANG', langCode)
    }
    catch(e) {
      console.log(e)
    }
  }
}

const serverModule = {
    //state,
    mutations,
    actions,
    //getters
  }

  export default serverModule;