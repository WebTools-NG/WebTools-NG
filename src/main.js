import Vue from 'vue'
import VueRouter from "vue-router"
import Vuex from "vuex"
import App from './App.vue'
import router from './router'
import store from './store'

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
log.transports.file.level = 'info';
log.transports.console.level = 'verbose';  
var appName = require('electron').remote.app.getName(); 
var appVersion = require('electron').remote.app.getVersion(); 

log.transports.file.fileName = appName;
console.log = log.log;

log.info('*********************************') 
log.info('Starting ' + appName + ' Version:' + appVersion);
// Logging ended

Vue.config.productionTip = false

new Vue({
  render: h => h(App),
  router: router,
  i18n,
  store: store  
}).$mount('#app')
