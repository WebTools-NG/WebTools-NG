<template>
  <b-container fluid>
    <div class="col-lg-10 col-md-12 col-xs-12">
        <h1>{{ $t("Modules.PMS.Settings.Settings") }}</h1>
        <p>{{ $t("Modules.PMS.Settings.Description") }}</p>           
    </div>
    <div>
        <b-form-group id="b-form-group">
            <b-form-checkbox-group
                stacked
                :options="cbOptions"
                v-model="cbSelected"
                @change.native="changedOptions">      
            </b-form-checkbox-group>
        </b-form-group>
    </div>
    <div class="d-flex align-items-center">
      <b-form-group id="etLibraryGroup" v-bind:label="$t('Modules.PMS.Settings.SelectSettingsSelection')" label-size="lg" label-class="font-weight-bold pt-0">        
        <!--         
        <div ref="libSpinner" id="libSpinner" :hidden="selLibraryWait">
        <b-spinner id="libLoad" class="ml-auto text-danger"></b-spinner>
        </div>
        -->
        <b-tooltip target="etLibraryGroup" triggers="hover">
          {{ $t('Modules.PMS.Settings.TTSelectSettingsSelection') }}
        </b-tooltip>
        <b-form-select 
          v-model="selSection"          
          id="selSection"          
          :options="selSectionOptions"
          name="selSection">        
        </b-form-select>
      </b-form-group>      
    </div>
  </b-container>
</template>

<script>
    const log = require("electron-log");
    import {wtutils, wtconfig, dialog} from '../../General/wtutils';
    import i18n from '../../../../i18n';
    import store from '../../../../store';

    wtutils, wtconfig, dialog, i18n, store
    

    export default {        
        data() {            
            return {
                selSectionOptions: [],
                selSection : "",
                cbSelected: [],                
                cbOptions: [
                    { text: i18n.t('Modules.PMS.Settings.OnlyHidden'), value: 'OnlyHidden' },
                    { text: i18n.t('Modules.PMS.Settings.OnlyAdvanced'), value: 'OnlyAdvanced' }                                                         
                ]                 
            };              
        },
        created() {
            log.info("PMS Settings Created");
            this.serverSelected();
            this.getServerSettings(); 
            this.getcbDefaults();           
        },
        computed: {
            selectedServerAddress: function(){
                return this.$store.getters.getSelectedServerAddress;
            }
        },
        methods: {
            async serverSelected() {
                let serverCheck = this.$store.getters.getSelectedServer;
                if (serverCheck == "none") {
                    log.debug("serverCheck is none");
                    this.$bvToast.toast(this.$t("Modules.PMS.ErrorNoServerSelectedMsg"), {
                        title: this.$t("Modules.PMS.ErrorNoServerSelectedTitle"),
                        autoHideDelay: 4000,          
                        solid: true,
                        variant: 'primary',
                        toaster: 'b-toaster-bottom-right' 
                        }
                    );
                }
            },
            async getServerSettings() {
                log.debug('Getting Server Settings');
                await store.dispatch('fetchPMSSettings', {
                    Token: this.$store.getters.getAuthToken,
                    Address: this.$store.getters.getSelectedServerAddress}); 
                log.debug('Options are: ' + JSON.stringify(Object.keys(this.$store.getters.getPMSSettings)))                
                this.selSectionOptions = Object.keys(this.$store.getters.getPMSSettings).sort();
            },
            changedOptions() {
                log.debug('Updating OnlyHidden Setting');
                //this.$nextTick(()=>{console.log(this.cbSelected);})
                for( var cbItem of ["OnlyHidden", "OnlyAdvanced"]){                    
                    wtconfig.set("PMS." + cbItem, (this.cbSelected.includes(cbItem))) 
                }
                this.getServerSettings();
            },
            getcbDefaults() {
                log.debug('Get OnlyHidden Setting');                
                const cbItems = ["OnlyHidden", "OnlyAdvanced"];
                for(let i = 0; i < cbItems.length; i++){                     
                    if (wtconfig.get("PMS." + cbItems[i], true)){
                        this.cbSelected.push(cbItems[i])
                    }                    
                } 
                log.debug('CBOptions: ' + this.cbSelected)               
            }
        }        
    };    

</script>
<style scoped>
    .outDirbox{
        margin-right:10px;
    }
    #b-form-group{
        margin-top: 20px;
    }
    
</style>
