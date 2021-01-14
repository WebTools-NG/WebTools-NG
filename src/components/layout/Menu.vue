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
    import '@fortawesome/fontawesome-free/css/all.css';
    import etIcon from '@/assets/ET-256.png'; 
    import pmsIcon from '@/assets/plex-pms-icon.png';  
    import plextvIcon from '@/assets/plex-app-icon.png';   

    export default {
        data() {
            return { 
                collapsed: false                
            }
        },
        computed: {
            menu(){
                return [
                    {
                        href: { path: '/home' },                        
                        title: this.$t("Common.Menu.Sidebar.Home.NavTitle"),
                        icon: 'fa fa-home'
                    },
                    {
                        header: true,
                        title: this.$t("Common.Menu.Sidebar.NavSections.Tools"),
                        hiddenOnCollapse: true
                    },
                    {
                        href: { path: '/plextv' },
                        title: this.$t("Modules.PlexTV.Name"),
                        // icon: 'fas fa-file-export',
                        icon: {
                            //adjust element
                                element: 'img',
                                attributes: { src: plextvIcon },
                            }                                               
                    },
                    {
                        href: { path: '/pms' },
                        title: this.$t("Modules.PMS.Name"),
                        // icon: 'fas fa-file-export',
                        icon: {
                            //adjust element
                                element: 'img',
                                attributes: { src: pmsIcon },
                            },
                        child: [
                            {                                
                                href: '/pms/settings',
                                title: this.$t("Common.Menu.Sidebar.PMS.Settings"),                                
                                icon: 'fa fa-cog'
                            }
                        ]                        
                    },
                    {
                        href: { path: '/export' },
                        title: this.$t("Modules.ET.Name"),
                        // icon: 'fas fa-file-export',
                        icon: {
                            //adjust element
                                element: 'img',
                                attributes: { src: etIcon },
                            },
                        child: [
                            {                                
                                href: '/export/settings',
                                title: this.$t("Common.Menu.Sidebar.ET.Settings"),                                
                                icon: 'fa fa-cog'
                            },
                            {                                
                                href: '/export/custom',
                                title: this.$t("Common.Menu.Sidebar.ET.Custom"),                                
                                icon: 'fa fa-cog'
                            }
                        ]
                        
                    },
                    {
                        header: true,
                        title: this.$t("Common.Menu.Sidebar.NavSections.Options"),
                        hiddenOnCollapse: true
                    },
                    {
                        href: { path: '/language' },
                        title: this.$t("Common.Menu.Sidebar.Language.NavTitle"),
                        //icon: 'fas fa-language'
                        icon: 'fa fa-globe'
                    },
                    {
                        href: '/settings',
                        title: this.$t("Common.Menu.Sidebar.Settings.NavTitle"),                                
                        icon: 'fa fa-cog'
                    },
                    {
                        href: { path: '/about' },
                        title: this.$t("Common.Menu.Sidebar.About.NavTitle"),
                        icon: 'fas fa-question-circle'
                    },
                    {
                        href: { path: '/' },
                        title: this.$t("Common.Menu.Sidebar.Theme.NavTitle"),
                        icon: 'fas fa-palette',
                        hidden: true
                    },
                    {
                        href: { path: '/' },
                        title: this.$t("Common.Menu.Sidebar.Reset.NavTitle"),
                        icon: 'fas fa-power-off',
                        hidden: true
                    }
                ]
            }
        },
        methods: {
            onToggleCollapse(collapsed) {
                this.$emit("e-iscollapsed", collapsed);
                log.info(collapsed)
            }  
        }
    }
</script>

<style lang="css" scoped>

.v-sidebar-menu {
  background-color: #363636;
}
</style>