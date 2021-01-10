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
          v-on:change="getGroupSelectedItem"          
          :options="selSectionOptions"
          name="selSection">        
        </b-form-select>
      </b-form-group>      
    </div>
    <div>        
        <b-table :items="settingsItems" :fields="settingsFields" caption-top>
            <template #table-caption>{{ $t('Modules.PMS.Settings.tblCaption') }}</template>
        </b-table>
  </div>
  </b-container>
</template>

<script>
    const log = require("electron-log");
    const {JSONPath} = require('jsonpath-plus');
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
                ],
                settingsFields: [                    
                    {name: { label: this.$i18n.t('Modules.PMS.Settings.tblName') }},
                    {label: { label: this.$i18n.t('Modules.PMS.Settings.tblLabel') }},
                    {summary: { label: this.$i18n.t('Modules.PMS.Settings.tblSummary') }},
                    {type: { label: this.$i18n.t('Modules.PMS.Settings.tblType') }},
                    {default: { label: this.$i18n.t('Modules.PMS.Settings.tblDefault') }},
                    {value: { label: this.$i18n.t('Modules.PMS.Settings.tblValue') }}
                ],
                settingsItems: [
                
                ]         
                /*         
                { name: 40, label: 'Dickerson', summary: 'Macdonald', type: 'text' },
                { name: 21, label: 'Larsen', summery: 'Shaw' },
                { name: 89, label: 'Geneva', summery: 'Wilson' } */
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
            getGroupSelectedItem: function(myarg) {
                log.debug(`Group changed to: ${myarg}`);
                // Update the data table with new settings                
                const filteredResult = JSONPath({path: `$.${myarg}`, json: this.$store.getters.getPMSSettings});
                log.debug(`filtered settings: ${JSON.stringify(filteredResult)}`);
                this.settingsItems = [];
                var jGed = JSON.parse(filteredResult[0]);
                log.debug('Ged Cava: ' + JSON.stringify(jGed))
                for (var i = 0; i < filteredResult.length; i++) {
                    log.debug('Ged Tommy: ' + JSON.stringify(filteredResult[i]));
                }
                var jFilteredResult = JSON.parse(filteredResult[0][0])
                log.debug('Ged prased: ' + JSON.stringify(jFilteredResult))
                filteredResult.forEach(function(item){
                    log.debug('Ged445566: ' + JSON.stringify(item));
                    var jItem = JSON.parse(item);
                    log.debug('Ged99: ' + jItem.key)
                    log.debug('Ged99-1: ' + jItem.value)
                });
                //var gedsettingItems = JSON.parse(filteredResult[0]);
                //log.debug('ged 33: ' + JSON.stringify(gedsettingItems))

                //filteredResult.forEach(item => {
                  //  log.debug('Ged Item: ' + JSON.stringify(item))
                    
                //});
            },
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
