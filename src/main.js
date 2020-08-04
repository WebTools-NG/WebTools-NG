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

import i18n from './i18n'

Vue.use(VueRouter);
Vue.use(Vuex);
Vue.use(VueSidebarMenu)
Vue.use(Buefy);
Vue.use(BootstrapVue);



// Logging start
// Remember to define log in all components where its used, as in below
const log = require('electron-log');
// Default file log level is info
log.transports.file.level = wtconfig.get('Log.fileLevel', 'info');
// Default console level is Silly, since used by us
log.transports.console.level = wtconfig.get('Log.consoleLevel', 'silly');


log.transports.file.fileName = wtutils.AppName;
// Set logfile to 10Mb
log.transports.file.maxSize = wtconfig.get('Log.maxSize', 1048576);



console.log = log.log;
log.info('*********************************') 
log.info('Starting ' + wtutils.AppName + ' Version:' + wtutils.AppVersion);
// Logging ended

// Get saved language to use, and default to en
i18n.locale = wtconfig.get('general.language', 'en')
Vue.config.productionTip = false

// App Menu Bar
log.info('Starting to build App Menu')
const menuTemplate = require('./menubar.js')
const menu = require('electron').remote.Menu.buildFromTemplate(menuTemplate.default)
require('electron').remote.Menu.setApplicationMenu(menu)
log.info('App Menu builded')




// ET-EXCEL STUFF

// We export library named "Ged" of the type movie with a level of "Level 3"
const libName = 'Movies'
//const level = 'Tommy'
const level = 'Level 3'
const libType = 'movie'

/*
Some hidden stuff during dev only
I need baseurl of the server, as 
well as the accesstoken, so I store 
those for devs only in the config file,
in a key named "Developer", and since this
is never pushed to GitHub, it's safe ;)
like:

{
	"general": {
		"username": "dane22",
		"language": "en",
		"rememberlastusername": true,
		"transfilescopied": "0.0.0"
	},
	"Log": {
		"maxSize": 10485760
	},
	"ET": {
		"OutPath": "/home/tm/Videos",
		"ArraySep": " - "
		"Default Sort title to title, if empty": true
	},
	"Developer": {
		"baseURI": "http://192.168.1.14:32400",
		"accessToken": "MyAccessToken",
		"password": "MyPassword"
	}
}
*/
const baseURI = wtconfig.get('Developer.baseURI', 'NO SERVER URI');
const accessToken = wtconfig.get('Developer.accessToken', 'NO SERVER TOKEN');

// Real stuff to use

// ET Stuff
import {excel2} from './components/modules/ExportTools/et'
import BootstrapVue from 'bootstrap-vue'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'


// Temp json files to export, until linked called by webpage
const testimp4 = require('./components/modules/ExportTools/Samples/testimp4.json')
const testimp3 = require('./components/modules/ExportTools/Samples/testimp3.json')
const testimp = require('./components/modules/ExportTools/Samples/testimp.json')
const testimp1 = require('./components/modules/ExportTools/Samples/testimp1.json')
const AllMovies = require('./components/modules/ExportTools/Samples/AllMovies.json')
const Fast = require('./components/modules/ExportTools/Samples/2Fast.json')



// EXCEL Stuff

 
// To avoid errors if not exporting, remove below when frontend is calling
libName, level, libType, baseURI, accessToken, excel2, testimp4, testimp3, testimp, testimp1, AllMovies, Fast

// Add a couple of Rows
//excel2.createOutFile( libName, level, libType, 'xlsx', testimp1, baseURI, accessToken );
//excel2.createOutFile( libName, level, libType, 'xlsx', testimp3, baseURI, accessToken );
//excel2.createOutFile( libName, level, libType, 'xlsx', Fast, baseURI, accessToken );
//excel2.createOutFile( libName, level, libType, 'xlsx', AllMovies, baseURI, accessToken );

new Vue({
  render: h => h(App),
  router: router,
  i18n,
  store: store  
}).$mount('#app')
