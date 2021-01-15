<template>
  <b-container fluid>
    <div class="col-lg-10 col-md-12 col-xs-12">
        <h1>{{ $t("Modules.PMS.Settings.Settings") }}</h1>
        <p>{{ $t("Modules.PMS.Settings.Description") }}</p> 
        <p>{{ $t("Modules.PMS.Settings.Notice") }}</p>           
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
        <b-modal ref="edtSetting" hide-footer v-bind:title=this.newSettingTitle >
            <div class="d-block text-center">
                <b-alert variant="danger" show>{{ $t('Modules.PMS.Settings.varning') }}</b-alert>
                <b-container fluid>
                    <b-row>
                        <b-col sm="2">
                        <label for="textarea-curSetting">{{ $t('Modules.PMS.Settings.curSetting') }}:</label>
                        </b-col>
                        <b-col sm="10">
                        <b-form-textarea                            
                            id="textarea-curSetting"
                            plaintext
                            size="sm"
                            v-model=this.curSetting
                            rows="1"
                            max-rows="8"
                        ></b-form-textarea>
                        </b-col>
                    </b-row>
                    <br>
                    <b-row>
                        <b-col sm="2">
                        <label for="textarea-defSetting">{{ $t('Modules.PMS.Settings.defSetting') }}:</label>
                        </b-col>
                        <b-col sm="10">
                        <b-form-textarea                            
                            id="textarea-defSetting"
                            plaintext
                            size="sm"
                            v-model=this.defSetting
                            rows="1"
                            max-rows="8"
                        ></b-form-textarea>
                        </b-col>
                    </b-row>
                </b-container>
                <br>
                <b-form-input 
                    v-model="newSettingValue"
                    v-bind:placeholder=this.newSettingValueTXT >
                </b-form-input>            
            </div>
            <b-button class="mt-3" variant="outline-primary" block @click="saveNewSetting">{{ this.newSettingSaveTxt }}</b-button>
        </b-modal>
    </div>
    <div>        
        <b-table 
            striped
            hover
            sticky-header 
            :items="settingsItems" 
            :fields="settingsFields" 
            caption-top
            bordered 
            @row-clicked="tblRowClicked">
            <template #table-caption>{{ $t('Modules.PMS.Settings.tblCaption') }}</template>
        </b-table>
  </div>
  </b-container>
</template>

<script>
    const log = require("electron-log");
    const {JSONPath} = require('jsonpath-plus');
    import {wtconfig} from '../../General/wtutils';
    import i18n from '../../../../i18n';
    import store from '../../../../store';

    
    export default {        
        data() {            
            return {
                newSettingTitle: "",
                newSettingValueTXT: this.$t('Modules.PMS.Settings.newSettingValueTXT'),
                newSettingSaveTxt: this.$t('Modules.ET.Custom.NewLevelSaveTxt'),
                curSetting: "",
                defSetting: "",
                newSettingValue: "",
                edtSettingKey: "",
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
                settingsItems: []                
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
            async saveNewSetting() {                
                log.debug(`Saving setting ${this.newSettingValue} for setting ${this.edtSettingKey}`);
                // Save setting               
                await store.dispatch('setPMSSetting', {
                    Token: this.$store.getters.getAuthToken,
                    Address: this.$store.getters.getSelectedServerAddress,
                    Setting: this.edtSettingKey,
                    Value: this.newSettingValue});
                this.$refs['edtSetting'].hide();
                await this.getServerSettings();
                this.updateTbl(this.selSection);
            },
            tblRowClicked(record) {
                // Edit Setting
                log.debug(`Edit Setting: ${record.name} with a def. setting of ${record.default} and current setting as ${record.value}`);
                this.defSetting = record.default;
                this.curSetting = record.value;
                if (!record.default)
                {
                    this.defSetting = '';
                }                
                else{
                    this.defSetting = record.default;
                }
                if (!record.value)
                {
                    if (record.type == 'bool'){
                        this.curSetting = 'false'
                    }
                    else {
                        this.curSetting = '';
                    }
                }                
                else{
                    this.curSetting = record.value;
                }                               
                this.edtSettingKey = record.name;                
                this.newSettingTitle = i18n.t('Modules.PMS.Settings.newSettingTitle', [this.edtSettingKey]);
                this.newSettingValue = "";
                this.$refs['edtSetting'].show();                                            
            },
            updateTbl(group) {
                // Update the data table with new settings                
                const filteredResult = JSONPath({path: `$.${group}`, json: this.$store.getters.getPMSSettings})[0];
                log.verbose(`filtered settings: ${JSON.stringify(filteredResult)}`);                
                this.settingsItems = [];
                for (var i = 0; i < filteredResult.length; i++) {                    
                    var entry = {};
                    entry['name'] = JSONPath({path: `$.*~`, json: filteredResult[i]})[0];
                    entry['label'] = JSONPath({path: `$..label`, json: filteredResult[i]})[0];
                    entry['summary'] = JSONPath({path: `$..summary`, json: filteredResult[i]})[0];
                    entry['type'] = JSONPath({path: `$..type`, json: filteredResult[i]})[0];
                    entry['default'] = JSONPath({path: `$..default`, json: filteredResult[i]})[0];
                    entry['value'] = JSONPath({path: `$..value`, json: filteredResult[i]})[0];
                    this.settingsItems.push(entry);                                        
                }
            },
            getGroupSelectedItem: function(myarg) {
                log.debug(`Group changed to: ${myarg}`);
                this.updateTbl(myarg);
                /* // Update the data table with new settings                
                const filteredResult = JSONPath({path: `$.${myarg}`, json: this.$store.getters.getPMSSettings})[0];
                log.verbose(`filtered settings: ${JSON.stringify(filteredResult)}`);                
                this.settingsItems = [];
                for (var i = 0; i < filteredResult.length; i++) {                    
                    var entry = {};
                    entry['name'] = JSONPath({path: `$.*~`, json: filteredResult[i]})[0];
                    entry['label'] = JSONPath({path: `$..label`, json: filteredResult[i]})[0];
                    entry['summary'] = JSONPath({path: `$..summary`, json: filteredResult[i]})[0];
                    entry['type'] = JSONPath({path: `$..type`, json: filteredResult[i]})[0];
                    entry['default'] = JSONPath({path: `$..default`, json: filteredResult[i]})[0];
                    entry['value'] = JSONPath({path: `$..value`, json: filteredResult[i]})[0];
                    this.settingsItems.push(entry);                                        
                } */
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
            async changedOptions() {
                log.debug('Updating OnlyHidden Setting');
                //this.$nextTick(()=>{console.log(this.cbSelected);})
                for( var cbItem of ["OnlyHidden", "OnlyAdvanced"]){                    
                    wtconfig.set("PMS." + cbItem, (this.cbSelected.includes(cbItem))) 
                }
                await this.getServerSettings();
                this.updateTbl(this.selSection);
            },
            getcbDefaults() {
                log.debug('Get OnlyHidden Setting');                
                const cbItems = ["OnlyHidden", "OnlyAdvanced"];
                for(let i = 0; i < cbItems.length; i++){                     
                    if (wtconfig.get("PMS." + cbItems[i], false)){
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
