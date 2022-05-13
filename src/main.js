import Vue from 'vue'
import VueRouter from "vue-router"
import Vuex from "vuex"
import App from './App.vue'
import router from './router'
import store from './store'
import {wtutils, wtconfig} from './components/modules/General/wtutils'
import VueSidebarMenu from 'vue-sidebar-menu'
import 'vue-sidebar-menu/dist/vue-sidebar-menu.css'
import '@fortawesome/fontawesome-free/css/all.css'
import i18n from './i18n'
import { BootstrapVue, BootstrapVueIcons } from 'bootstrap-vue'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

Vue.use(VueRouter);
Vue.use(Vuex);
Vue.use(VueSidebarMenu);
Vue.use(BootstrapVue);
Vue.use(BootstrapVueIcons);

// Logging start
// Remember to define log in all components where its used, as in below
const log = require('electron-log');
log.transports.file.fileName = wtutils.logFileName;
console.log = log.log;
// Default file log level is info
log.transports.file.level = wtconfig.get('Log.fileLevel', 'info');
// Default console level is Silly, since used by us
log.transports.console.level = wtconfig.get('Log.consoleLevel', 'silly');

// Set logfile to 10Mb
log.transports.file.maxSize = wtconfig.get('Log.maxSize', 1048576);
log.info('[main.js] *********************************')
log.info(`[main.js] Starting ${wtutils.AppName} Version: ${wtutils.AppVersion}`);
log.info(`[main.js] Running on ${wtutils.RunningOS}`);
log.info(`[main.js] Log level set to ${log.transports.file.level}`);
// Logging ended

// Log Commandline Params
// This will handle any commandline params that we use
const params = require('electron').remote.process.argv;
params.forEach(param => {
    // log.verbose(`Param is: ${param}`);
    if (param.toLowerCase().startsWith("x-plex-token"))
    {
        // SECURITY ISSUE...Do not enable next line, except when debugging
        // log.verbose(`Found Token as: ${param.split('=')[1]}`)
        store.commit("UPDATE_AUTHTOKEN", param.split('=')[1]);
    }
});

// Handles dev stuff from Json
const token = wtconfig.get('Developer.X-Plex-Token', '');
if ( token != ''){
  log.verbose(`[main.js] Logging in with Dev Token`);
  store.commit("UPDATE_AUTHTOKEN", token);
}

// Prepopulate config file with defaults
if (wtconfig.get("general.version", "") != wtutils.AppVersion){
	// Config file out of date, so prepopulate with default values if missing
	wtutils.UpdateConfigFile();
}

// Log prefs settings
var fs = require('fs');
var prefs = JSON.parse(fs.readFileSync(wtutils.ConfigFileName, 'utf8'));
delete prefs ['Developer'];
log.verbose('[main.js] ***** Prefs *****');
log.verbose(prefs);
log.verbose('[main.js] ***** Prefs Ended *****');

// Get saved language to use, and default to en
i18n.locale = wtconfig.get('General.language', 'en');

// App Menu Bar
log.verbose('[main.js] Starting to build App Menu');
const menuTemplate = require('./components/layout/script/menubar');
const menu = require('electron').remote.Menu.buildFromTemplate(menuTemplate.default);
require('electron').remote.Menu.setApplicationMenu(menu);
log.verbose('[main.js] App Menu builded');

Vue.config.productionTip = false;




new Vue({
  render: h => h(App),
  router: router,
  store: store,
  i18n
}).$mount('#app')
