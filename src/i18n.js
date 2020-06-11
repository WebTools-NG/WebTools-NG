import Vue from 'vue'
import VueI18n from 'vue-i18n'
import {wtutils} from './wtutils'

Vue.use(VueI18n)

function loadLocaleMessages () {  
  wtutils.MoveToHome();
  const messages = {}
  var fs = require('fs');    
  const localHome = wtutils.Home + '/locales'  
  console.log('LocalHome detected as: ' + localHome);    
  const items = fs.readdirSync(localHome)                   
  console.log('Files count is: ' + items.length)
  for (var i=0; i<items.length; i++) {                                    
      console.log('found translation file : ' + items[i]);        
      let langCode = items[i].split(".")[0];
      let langFile = localHome + '/' + items[i];
      messages[langCode] = JSON.parse(fs.readFileSync(langFile, 'utf8'));         
    }        

  console.log('********* Done reading translations ***********')  
  return messages
}


export default new VueI18n({
  locale: process.env.VUE_APP_I18N_LOCALE || 'en',
  fallbackLocale: process.env.VUE_APP_I18N_FALLBACK_LOCALE || 'en',
  messages: loadLocaleMessages()
})
