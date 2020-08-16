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
                        title: i18n.t("Common.Menu.Modules.Home.NavTitle"),
                        icon: 'fa fa-home'
                    },
                    {
                        header: true,
                        title: i18n.t("Common.Menu.NavSections.Tools"),
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
                        title: i18n.t("Common.Menu.NavSections.Options"),
                        hiddenOnCollapse: true
                    },
                    {
                        href: { path: '/language' },
                        title: i18n.t("Common.Menu.Modules.Language.NavTitle"),
                        icon: 'fas fa-language'
                    },
                    {
                        href: { path: '/about' },
                        title: i18n.t("Common.Menu.Modules.About.NavTitle"),
                        icon: 'fas fa-question-circle'
                    },
                    {
                        href: { path: '/' },
                        title: i18n.t("Common.Menu.Modules.Theme.NavTitle"),
                        icon: 'fas fa-palette',
                        hidden: true
                    },
                    {
                        href: { path: '/' },
                        title: i18n.t("Common.Menu.Modules.Reset.NavTitle"),
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