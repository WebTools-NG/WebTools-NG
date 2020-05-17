import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'
import Export from '../components/Export.vue'
import Language from '../components/Language.vue'
import Store from '../store/index.js'
Vue.use(VueRouter)

  const router = new VueRouter({
    mode: 'history',
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
    path: '/language',
    name: "language",
    component: Language,
    meta: {requiresAuth: true}
  }
]});

router.beforeEach( (to,from,next) => {
  let routerAuthCheck = Store.state.authenticated;

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
