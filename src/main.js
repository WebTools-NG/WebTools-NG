import Vue from 'vue'
import VueRouter from "vue-router"
import Vuex from "vuex"
import App from './App.vue'
import router from './router'
import store from './store'
import {wtutils, wtconfig, dialog} from './wtutils'

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
// Default file log level is info
log.transports.file.level = wtconfig.get('Log.fileLevel', 'info');
// Default console level is Silly, since used by us
log.transports.console.level = wtconfig.get('Log.consoleLevel', 'silly');
log.transports.file.fileName = wtutils.AppName;
// Set logfile to 1Mb
log.transports.file.maxSize = wtconfig.get('Log.maxSize', 1048576);


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


// ET-EXCEL STUFF

// We export library named "Ged" of the type movie with a level of "Level 2"
const libName = 'Ged'
const level = 'Test Tommy Done2'
//const level = 'Test Tommy'
//const level = 'Level 2'
const libType = 'movie'

libType
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
		"transfilescopied": "0.1.0"
	},
	"ET": {
		"OutPath": "/home/tm/Videos",
		"ArraySep": " - "
	},
	"Developer": {
		"baseURI": "http://192.168.1.14:32400",
		"accessToken": "MyAccessToken"
	}
}
*/
const baseURI = wtconfig.get('Developer.baseURI', 'NO SERVER URI');
const accessToken = wtconfig.get('Developer.accessToken', 'NO SERVER TOKEN');

baseURI
accessToken

// Real stuff to use

// ET Stuff
//import {excel} from './components/modules/ExportTools/et'

import {excel2} from './components/modules/ExportTools/et'

const testimp4 = require('./components/modules/ExportTools/testimp4.json')
const testimp3 = require('./components/modules/ExportTools/testimp3.json')
const testimp = require('./components/modules/ExportTools/testimp.json')
const testimp1 = require('./components/modules/ExportTools/testimp1.json')

// Just use to avoid errors later
testimp4
testimp3
testimp
testimp1


// EXCEL Stuff
// Create WorkBook
//const WorkBook = excel.NewExcelFile()
// Create Sheet
//const Sheet = excel.NewSheet(WorkBook, libName, level)
// Now add the header column
//excel.AddHeader(Sheet, level, libType)
// Add a couple of Rows
//excel.addToSheet(Sheet, libType, level, testimp3, baseURI, accessToken)
//excel.addToSheet(Sheet, libType, level, testimp, baseURI, accessToken)
//excel.addToSheet(Sheet, libType, level, testimp1, baseURI, accessToken)
console.log('Ged main call')
//excel.addToSheet(Sheet, libType, level, testimp1, baseURI, accessToken, WorkBook, libName, 'xlsx')
excel2.createOutFile( libName, level, libType, 'xlsx', testimp3, baseURI, accessToken );
console.log('Ged main ended')
// Save Excel file
//excel.SaveWorkbook(WorkBook, libName, level, 'xlsx')


//const baseURI = wtconfig.get('Developer.baseURI', 'NO SERVER URI');
//const accessToken = wtconfig.get('Developer.accessToken', 'NO SERVER TOKEN');
//const sectionID = 4;
//excel.exportMedia(baseURI, accessToken, level, sectionID)


new Vue({
  render: h => h(App),
  router: router,
  i18n,
  store: store  
}).$mount('#app')
