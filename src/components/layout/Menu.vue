<template>
  <sidebar-menu 
  :menu="menu"
  :collapsed="collapsed"
  @toggle-collapse="onToggleCollapse"
 />
</template>

<script>
const log = require('electron-log');
console.log = log.log;
import '@fortawesome/fontawesome-free/css/all.css'
import etIcon from '@/assets/ET-256.png';
import i18n from '../../i18n'
    export default {
        data() {
            return { 
                menu: [
                    {
                        href: { path: '/home' },
                        title: i18n.t("Common.Menu.Sidebar.Home.NavTitle"),
                        icon: 'fa fa-home'
                    },
                    {
                        header: true,
                        title: i18n.t("Common.Menu.Sidebar.NavSections.Tools"),
                        hiddenOnCollapse: true
                    },
                    {
                        href: { path: '/export' },
                        title: i18n.t("Modules.ET.Name"),
                        // icon: 'fas fa-file-export',
                        icon: {
                            //adjust element
                                element: 'img',
                                attributes: { src: etIcon },
                            },
                        child: [
                            {                                
                                href: '/export/settings',
                                title: i18n.t("Common.Menu.Sidebar.ET.Settings"),                                
                                icon: 'fa fa-cog'
                            }
                        ]
                        
                    },
                    {
                        header: true,
                        title: i18n.t("Common.Menu.Sidebar.NavSections.Options"),
                        hiddenOnCollapse: true
                    },
                    {
                        href: { path: '/language' },
                        title: i18n.t("Common.Menu.Sidebar.Language.NavTitle"),
                        icon: 'fas fa-language'
                    },
                    {
                        href: '/settings',
                        title: i18n.t("Common.Menu.Sidebar.Settings.NavTitle"),                                
                        icon: 'fa fa-cog'
                    },
                    {
                        href: { path: '/about' },
                        title: i18n.t("Common.Menu.Sidebar.About.NavTitle"),
                        icon: 'fas fa-question-circle'
                    },
                    {
                        href: { path: '/' },
                        title: i18n.t("Common.Menu.Sidebar.Theme.NavTitle"),
                        icon: 'fas fa-palette',
                        hidden: true
                    },
                    {
                        href: { path: '/' },
                        title: i18n.t("Common.Menu.Sidebar.Reset.NavTitle"),
                        icon: 'fas fa-power-off',
                        hidden: true
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