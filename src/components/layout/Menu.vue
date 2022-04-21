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
    import {wtconfig, wtutils} from '../../components/modules/General/wtutils';


    wtconfig, wtutils

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
                        hidden: wtutils.hideMenu('plextv'),
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
                        hidden: wtutils.hideMenu('pms'),
                        // icon: 'fas fa-file-export',
                        icon: {
                            //adjust element
                                element: 'img',
                                attributes: { src: pmsIcon },
                            },
                        child: [
                            {
                                href: '/pms/settings',
                                hidden: wtutils.hideMenu('pmsSettings'),
                                title: this.$t("Common.Menu.Sidebar.PMS.Settings"),
                                icon: 'fa fa-cog'
                            },
                            {
                                href: '/pms/butler',
                                title: this.$t("Common.Menu.Sidebar.PMS.Butler"),
                                hidden: wtutils.hideMenu('pmsButler'),
                                icon: 'fa fa-tasks'
                            },
                            {
                                href: { path: '/pms/dvr' },
                                title: this.$t("Modules.PMS.DVR.Name"),
                                hidden: wtutils.hideMenu('pmsDVR'),
                                icon: 'fas fa-tv',
                            }
                            ,
                            {
                                href: { path: '/pms/viewstate' },
                                title: this.$t("Modules.PMS.ViewState.Name"),
                                hidden: wtutils.hideMenu('pmsViewState'),
                                icon: 'fas fa-tv',
                            }
                        ]
                    },
                    {
                        href: { path: '/export' },
                        title: this.$t("Modules.ET.Name"),
                        hidden: wtutils.hideMenu('et'),
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
                                hidden: wtutils.hideMenu('etSettings'),
                                icon: 'fa fa-cog'
                            },
                            {
                                href: '/export/custom',
                                title: this.$t("Common.Menu.Sidebar.ET.Custom"),
                                hidden: wtutils.hideMenu('etCustom'),
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
                        hidden: wtutils.hideMenu('Language'),
                        //icon: 'fas fa-language'
                        icon: 'fa fa-globe'
                    },
                    {
                        href: '/settings',
                        title: this.$t("Common.Menu.Sidebar.Settings.NavTitle"),
                        hidden: wtutils.hideMenu('Settings'),
                        icon: 'fa fa-cog'
                    },
                    {
                        href: { path: '/about' },
                        title: this.$t("Common.Menu.Sidebar.About.NavTitle"),
                        hidden: wtutils.hideMenu('About'),
                        icon: 'fas fa-question-circle'
                    },
                    {
                        href: { path: '/' },
                        title: this.$t("Common.Menu.Sidebar.Theme.NavTitle"),
                        hidden: wtutils.hideMenu('Theme'),
                        icon: 'fas fa-palette'
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