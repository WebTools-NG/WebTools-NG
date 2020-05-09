<template>
  <div id="app">
    <div id="content" :class="{ collapsed: isCollapsed }">
      <Header></Header>
      <div>
        <router-view></router-view>
      </div>
    </div>
    <div id="side-menu">
        <Menu @e-iscollapsed='setCollapsed'></Menu>
    </div>
  </div>
</template>

<script>

import Menu from './components/layout/Menu';
import Header from './components/layout/Header';


export default {
  name: "app",
  data(){
    return {
      isCollapsed: false
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
  }
  }
</script>

<style>
#content.collapsed {
  padding-left: 62px;
}
#content {
  padding-left: 250px;
    transition: 0.3s ease;

}
.v-sidebar-menu.vsm_expanded {
  max-width: 250px !important;
}




</style>

