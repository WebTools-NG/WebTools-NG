import Vue from 'vue'
import VueRouter from "vue-router"
import Vuex from "vuex"
import App from './App.vue'
import router from './router'
import store from './store'
import {wtutils, wtconfig, dialog} from './wtutils'

//import dialog from 'electron'


/*Icons - Styling - Design Frameworks - Sidemenu*/
import Buefy from 'buefy'
import 'buefy/dist/buefy.css'
import VueSidebarMenu from 'vue-sidebar-menu'
import 'vue-sidebar-menu/dist/vue-sidebar-menu.css'
import '@fortawesome/fontawesome-free/css/all.css'

import i18n from './i18n'

Vue.use(VueRouter);
Vue.use(Vuex);
Vue.use(VueSidebarMenu)
Vue.use(Buefy);

// Logging start
// Remember to define log in all components where its used, as in below
const log = require('electron-log');
log.transports.file.level = 'verbose';
log.transports.console.level = 'verbose';
log.transports.file.fileName = wtutils.AppName;
console.log = log.log;
log.info('*********************************') 
log.info('Starting ' + wtutils.AppName + ' Version:' + wtutils.AppVersion);
// Logging ended

//wtutils.MoveToHome();

// Get saved language to use, and default to en
i18n.locale = wtconfig.get('general.language', 'en')

Vue.config.productionTip = false

// App Menu Bar
log.info('Starting to build App Menu')
const menuTemplate = require('./menubar.js')
const menu = require('electron').remote.Menu.buildFromTemplate(menuTemplate.default)
require('electron').remote.Menu.setApplicationMenu(menu)
log.info('App Menu builded')


console.log('*********** Ged CASPER start dialog ************');
console.log('Se main.js linie 54 for at lave en dialog i ET, så');
console.log('vi kan gemme std. output dir');
console.log('Gemmes med wtconfig.set("ET.OutPath", <sti til dir>)');

// Nedenstående line slettes nå vi bruger det
dialog;
/* 

const outDir = dialog.OpenDirectory('Title', i18n.t('Common.OK'));
if (outDir)
{
  wtconfig.set('ET.OutPath', outDir[0]);
} */

// for at lave en dialog til at vælge et filnavn, se nedenstående
//console.log('FileName: ' +  dialog.SaveFile('Title', wtconfig.get('ET.OutPath', wtutils.UserHomeDir), i18n.t('Common.OK')));


new Vue({
  render: h => h(App),
  router: router,
  i18n,
  store: store  
}).$mount('#app')
