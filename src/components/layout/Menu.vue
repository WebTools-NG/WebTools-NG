<template>
  <sidebar-menu 
  :menu="menu"
  :collapsed="collapsed"
  @toggle-collapse="onToggleCollapse"
  @item-click="onItemClick"
 />
</template>

<script>
import '@fortawesome/fontawesome-free/css/all.css'


    export default {
        data() {
            return { 
                menu: [
                    {
                        href: { path: '/home' },
                        title: 'Home',
                        icon: 'fa fa-home'
                    },
                    {
                        header: true,
                        title: 'Tools',
                        hiddenOnCollapse: true
                    },
                    {
                        href: { path: '/export' },
                        title: 'Export',
                        icon: 'fas fa-file-export'
                        
                    },
                    {
                        href: { path: '/' },
                        title: 'Subtitles',
                        icon: 'fas fa-closed-captioning'
                    },
                    {
                        href: { path: '/' },
                        title: 'Logs',
                        icon: 'fas fa-clipboard-list'
                    },
                    {
                        href: { path: '/' },
                        title: 'UAS',
                        icon: 'fas fa-box-open'
                    },
                    {
                        href: { path: '/' },
                        title: 'FindMedia',
                        icon: 'fas fa-photo-video'
                    },
                    {
                        href: { path: '/' },
                        title: 'Playlists',
                        icon: 'fas fa-list'
                    },
                    {
                        href: { path: '/' },
                        title: 'Techinfo',
                        icon: 'fas fa-stethoscope'
                    }, 
                    {
                        header: true,
                        title: 'Options',
                        hiddenOnCollapse: true
                    },
                    {
                        href: { path: '/' },
                        title: 'Language',
                        icon: 'fas fa-language'
                    },
                    {
                        href: { path: '/' },
                        title: 'About us',
                        icon: 'fas fa-question-circle'
                    },
                    {
                        href: { path: '/' },
                        title: 'Theme',
                        icon: 'fas fa-palette'
                    },
                    {
                        href: { path: '/' },
                        title: 'Factory Reset',
                        icon: 'fas fa-power-off'
                    },
                    {
                        href: { path: '/' },
                        title: 'Logout',
                        icon: 'fas fa-sign-out-alt'
                    },
                    {
                        header: true,
                        title: 'Help',
                        hiddenOnCollapse: true
                    },
                    {
                        href: { path: '/' },
                        title: 'WebTools Forum',
                        icon: 'fab fa-forumbee'
                    },
                    {
                        href: { path: '/' },
                        title: 'WebTools Github',
                        icon: 'fab fa-github'
                    },
                    {
                        href: { path: '/' },
                        title: 'WebTools Wiki',
                        icon: 'fab fa-wikipedia-w',
                    }
                ], 
                  collapsed: false,
                  }
            },methods: {
              onToggleCollapse(collapsed) {
                this.$emit("e-iscollapsed", collapsed);
                console.log(collapsed)

              },
              onItemClick(event, item) {
                      console.log('onItemClick')
                             console.log(event)
                      console.log(item)

              }

        },
        
    }
</script>

<style lang="css" scoped>

.v-sidebar-menu {
  background-color: #363636;
}
</style>