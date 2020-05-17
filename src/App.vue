<template>
  <div id="app">

    <div id="auth_login" v-if="isAuth == false">
      <router-view></router-view>
    </div>

    <div id="content" :class="{ collapsed: isCollapsed }" v-if="isAuth">
      <Header></Header>
      <div>
        <router-view></router-view>
      </div>
    </div>
    <div id="side-menu" v-if="isAuth">
        <Menu @e-iscollapsed='setCollapsed'></Menu>
    </div>
  </div>
</template>

<script>

import Menu from './components/layout/Menu';
import Header from './components/layout/Header';
import store from './store'



export default {
  name: "app",
  data(){
    return {
      isCollapsed: false,
      store
    }
  },
  components:{
    Menu,
    Header,
  }, methods: {
    setCollapsed(value){
      console.log("This is a call")
      console.log(value)
      this.isCollapsed = value
    },
    
  }, props: {
     width: {
      type: String,
      default: '250px'
    }
  }, computed: {
    isAuth () {
      return this.$store.state.authenticated
    }
  }
  }
</script>

<style>
#content.collapsed {
  padding-left: 50px;
}
#content {
  padding-left: 250px;
    transition: 0.3s ease;

}
.v-sidebar-menu.vsm_expanded {
  max-width: 250px !important;
}




</style>

