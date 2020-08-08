<template>
  <sidebar-menu 
  :menu="menu"
  :collapsed="collapsed"
  @toggle-collapse="onToggleCollapse"
 />
</template>

<script>
const log = require('electron-log');
import '@fortawesome/fontawesome-free/css/all.css'
import i18n from '../../i18n'
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
                        icon: 'fas fa-file-export',
                        child: [
                            {                                
                                href: '/export/settings',
                                title: i18n.t("Common.Menu.Modules.ET.Settings"),                                
                                icon: 'fa fa-cog'
                            }
                        ]
                        
                    },
                    {
                        header: true,
                        title: 'Options',
                        hiddenOnCollapse: true
                    },
                    {
                        href: { path: '/language' },
                        title: 'Language',
                        icon: 'fas fa-language'
                    },
                    {
                        href: { path: '/about' },
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
                    }
                ], 
                  collapsed: false,
                  }
            },methods: {
              onToggleCollapse(collapsed) {
                this.$emit("e-iscollapsed", collapsed);
                log.info(collapsed)
              },
        },  
    }
</script>

<style lang="css" scoped>

.v-sidebar-menu {
  background-color: #363636;
}
</style>