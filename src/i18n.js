import Vue from 'vue'
import VueI18n from 'vue-i18n'
import {wtutils, wtconfig} from './components/modules/General/wtutils'

const log = require('electron-log');
console.log = log.log;

Vue.use(VueI18n)

function loadLocaleMessages () {  
  wtutils.MoveToHome();
  const messages = {}
  const fs = require('fs')
  // Force read en lang, since it's the fallback
  const langCode = 'en'
  var langFile = wtutils.Home + '/locales/' + langCode + '.json'  
  log.debug(`Loading language: ${langCode}`)  
  messages[langCode] = JSON.parse(fs.readFileSync(langFile, 'utf8')); 
  log.debug(`Defined language: ${wtconfig.get('General.language')}`)
  if (wtconfig.get('General.language', 'en') != 'en'){
    // We need to preload an additional language
    const langCode = wtconfig.get('General.language')
    langFile = wtutils.Home + '/locales/' + langCode + '.json'
    log.debug(`Loading language: ${langCode}`)
    messages[langCode] = JSON.parse(fs.readFileSync(langFile, 'utf8'));
  }
  return messages
}

export default new VueI18n({
  locale: process.env.VUE_APP_I18N_LOCALE || 'en',
  fallbackLocale: process.env.VUE_APP_I18N_FALLBACK_LOCALE || 'en',
  messages: loadLocaleMessages()
})
