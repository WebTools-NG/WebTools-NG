import Vue from 'vue'
import VueRouter from "vue-router"
import Vuex from "vuex"
import App from './App.vue'
import router from './router'
import store from './store'
import {wtutils, wtconfig} from './wtutils'
import VueSidebarMenu from 'vue-sidebar-menu'
import 'vue-sidebar-menu/dist/vue-sidebar-menu.css'
import '@fortawesome/fontawesome-free/css/all.css'
import i18n from './i18n'
import { BootstrapVue, BootstrapVueIcons } from 'bootstrap-vue'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'


Vue.use(VueRouter);
Vue.use(Vuex);
Vue.use(VueSidebarMenu)
Vue.use(BootstrapVue);
Vue.use(BootstrapVueIcons)



// Logging start
// Remember to define log in all components where its used, as in below
const log = require('electron-log');
console.log = log.log;
// Default file log level is info
log.transports.file.level = wtconfig.get('Log.fileLevel', 'info');
// Default console level is Silly, since used by us
log.transports.console.level = wtconfig.get('Log.consoleLevel', 'silly');
log.transports.file.fileName = wtutils.AppName;
// Set logfile to 10Mb
log.transports.file.maxSize = wtconfig.get('Log.maxSize', 1048576);
log.info('*********************************') 
log.info('Starting ' + wtutils.AppName + ' Version:' + wtutils.AppVersion);
// Logging ended

// Prepopulate config file with defaults
if (wtconfig.get("general.version", "") != wtutils.AppVersion){
	// Config file out of date, so prepopulate with default values if missing	
	wtutils.UpdateConfigFile()
}

// Get saved language to use, and default to en
i18n.locale = wtconfig.get('General.language', 'en')

// App Menu Bar
log.info('Starting to build App Menu')
const menuTemplate = require('./menubar.js')
const menu = require('electron').remote.Menu.buildFromTemplate(menuTemplate.default)
require('electron').remote.Menu.setApplicationMenu(menu)
log.info('App Menu builded')

Vue.config.productionTip = false

new Vue({
  render: h => h(App),
  router: router,
  store: store,
  i18n 
}).$mount('#app')
