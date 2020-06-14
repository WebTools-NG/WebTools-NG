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
log.transports.file.level = 'debug';
log.transports.console.level = 'silly';
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


// ET-EXCEL STUFF

// We export library named "Ged" of the type movie with a level of "Level 1"
const libName = 'Ged'
const level = 'Level 2'
const libType = 'movie'
// Real stuff to use


// ET Stuff
import {et, excel} from './components/modules/ExportTools/et'
// Get possible levels for movie
console.log('Possible levels key/val are: ' + JSON.stringify(et.getLevels(libType)))
console.log('Possible levels key only names: ' + et.getLevelKeys(libType))
console.log('RealLevelName: ' + et.getRealLevelName(level, libType))
console.log('Fields in this level: ' + JSON.stringify(et.getLevelFields(level, libType)))


// EXCEL Stuff
// Create WorkBook
const WorkBook = excel.NewExcelFile()
// Create Sheet
const Sheet = excel.NewSheet(WorkBook, libName, level)
// Now add the header column
excel.AddHeader(Sheet, level, libType)
// Add a couple of Rows
let Row = []
Row = ['ged1', 'ged2', 'ged3']
excel.AddRow(Sheet, Row)
Row = ['ged2-1', 'ged2-2', 'ged2-3']
excel.AddRow(Sheet, Row)

// Save Excel file
excel.SaveWorkbook(WorkBook, libName, level, 'xlsx')



new Vue({
  render: h => h(App),
  router: router,
  i18n,
  store: store  
}).$mount('#app')
