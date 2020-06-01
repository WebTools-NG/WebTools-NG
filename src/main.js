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

// let isElectron = require("is-electron");

// Logging

const log = require('electron-log');
log.transports.file.level = 'info';
log.transports.console.level = 'verbose';  
var name = require('electron').remote.app.getName();  
log.transports.file.fileName = name
console.log = log.log;
var version = require('electron').remote.app.getVersion(); 
log.info('*********************************') 
log.info('Starting ' + name + ' Version:' + version);

Vue.config.productionTip = false

new Vue({
  render: h => h(App),
  router: router,
  i18n,
  store: store  
}).$mount('#app')
