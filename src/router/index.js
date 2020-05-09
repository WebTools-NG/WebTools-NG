import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'
import store from '../store/index.js'

Vue.use(VueRouter)
  const routes = [
  {
    path: '/',
    redirect: {
      name: "login"
    }
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
    beforeRouteEnter: (to, from, next) => {
      if(store.state.authenticated == false) {
        next(false);
        //Dont go to route
      } else {
          next();
          //Allow to route
      }
    }
  }
]

const router = new VueRouter({
  routes
})

export default router
