import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'
import Export from '../components/modules/ExportTools/Export'
import Language from '../components/Language.vue'
import GlobalSettings from '../components/GlobalSettings.vue'
import About from '../components/About'
import Store from '../store/index.js'
import ExportSettings from '../components/modules/ExportTools/Settings/settings'
Vue.use(VueRouter)

  const router = new VueRouter({
    
    mode: process.env.IS_ELECTRON ? 'hash' : 'history',
    base: process.env.BASE_URL,
    routes: [
  {
    path: '/',
    name: "/",
    component: Home,
    meta: {requiresAuth: true}
  },
  {
    path: '/login',
    name: 'login',
    component: Login

  },
  {
    path: '/home',
    name: "home",
    component: Home,
    meta: {requiresAuth: true}
  },
  {
    path: '/export',
    name: "export",
    component: Export,
    meta: {requiresAuth: true}
  },
  {
    path: '/export/settings',
    name: "exportsettings",
    component: ExportSettings,
    meta: {requiresAuth: true}
  },
  {
    path: '/language',
    name: "language",
    component: Language,
    meta: {requiresAuth: true}
  },
  {
    path: '/settings',
    name: "settings",
    component: GlobalSettings,
    meta: {requiresAuth: true}
  },
  {
    path: '/about',
    name: "about",
    component: About,
    meta: {requiresAuth: true}
  }
]});

router.beforeEach( (to,from,next) => {
  let routerAuthCheck = Store.state.plextv.authenticated;

  if (to.matched.some(record => record.meta.requiresAuth)) {
    if(routerAuthCheck){
      next();
    } else {
      router.replace('/login')
    }

  } else {
    //allows routing
    next();
  }
});



export default router
