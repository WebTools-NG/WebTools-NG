import Vue from 'vue'
import VueRouter from "vue-router"
import Vuex from "vuex"
import App from './App.vue'
import router from './router'
import store from './store'
import {wtutils, wtconfig} from './wtutils'

/*Icons - Styling - Design Frameworks - Sidemenu*/
import Buefy from 'buefy'
import 'buefy/dist/buefy.css'
import VueSidebarMenu from 'vue-sidebar-menu'
import 'vue-sidebar-menu/dist/vue-sidebar-menu.css'
import '@fortawesome/fontawesome-free/css/all.css'
//wtutils.MoveToHome();
import i18n from './i18n'

/* i18n.setLocaleMessage('da', require('/home/tm/data/github/WebTools-NG/public/locales/da').default);
i18n.locale = 'da';
 */

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

new Vue({
  render: h => h(App),
  router: router,
  i18n,
  store: store  
}).$mount('#app')
