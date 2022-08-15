<template>
  <b-container class="m-2 mt-2">
  <div>   <!-- Title and desc -->
    <h2>
      {{ $t(`Modules.PMS.Settings.Name`) }}
    </h2>
    <h5>{{ $t(`Modules.PMS.Settings.Description`) }}</h5>
  </div>
  <b-link id="general" :to="{ path: '/settings/export', query: { return: 'pmssettings' } }">{{ $t("Modules.ET.Settings.Note") }} </b-link>
  <br>
  <p>{{ $t("Modules.PMS.Settings.Notice") }}</p>
  <br>
  <div> <!-- Settings to show -->

<!-- tt="Modules.PMS.Settings.TTSettingsFilter" color="green" -->

    <b-form-group id="FilterSettingsGroup" label-size="lg" label-class="font-weight-bold pt-0">
      <WTNGttlabel tt="Modules.PMS.Settings.TTSettingsFilter" label="GummiGed 664 lidt mere" />


<!--
        <template v-slot:label>
            <div class="icon is-right">
                {{$t(`Modules.PMS.Settings.SettingsFilter`)}}
                <b-tooltip target="FilterSettingsTT" triggers="hover">
                    {{ $t(`Modules.PMS.Settings.TTSettingsFilter`) }}
                </b-tooltip>
                <span id="FilterSettingsTT"><i class="ttqmark far fa-question-circle"></i></span>
            </div>
        </template>
        -->



      <b-form-radio-group
        id="FilterSettings"
        v-model="selFilterSetting"
        @change.native="changeFilterSetting()"
        :options="FilterSettingsOptions"
        name="FilterSettings"
      >
      </b-form-radio-group>
    </b-form-group>
  </div>
  <div class="d-flex align-items-center">
    <b-form-group id="etLibraryGroup" v-bind:label="$t('Modules.PMS.Settings.SelectSettingsSelection')" label-size="lg" label-class="font-weight-bold pt-0">
      <b-form-select
        v-model="selSection"
        id="selSection"
        v-on:change="getGroupSelectedItem"
        :options="selSectionOptions"
        style="width: 75%"
        name="selSection">
      </b-form-select>
      <WTNGtt tt="Modules.PMS.Settings.TTSelectSettingsSelection" size="20px"></WTNGtt>
    </b-form-group>
  </div>
  <div> <!-- Modal popup -->
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
              >
              </b-form-textarea>
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
                >
                </b-form-textarea>
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
    <br>
    <div class="buttons">   <!-- Buttons -->
        <div id="buttons" class="text-center">
            <b-button-group >
                <b-button variant="success" class="mr-1" :disabled="this.selSection == ''" @click="exportSettings"> {{ $t('Modules.PMS.Settings.ExportGroupSettings') }} </b-button>
                <b-button variant="success" class="mr-1"  @click="exportAllSettings">{{ $t('Modules.PMS.Settings.ExportAllSettings') }}</b-button>
            </b-button-group>
        </div>
    </div>
    <br>
  </b-container>
</template>

<script>
    const log = require("electron-log");
    const {JSONPath} = require('jsonpath-plus');
    import {wtconfig} from './../../General/wtutils';
    import WTNGtt from './../../General/wtng-tt.vue';
    import WTNGttlabel from './../../General/wtng-ttlabel.vue'
    import i18n from '../../../../i18n';
    import store from '../../../../store';
    import { pmssettings } from "./scripts/settings";
    export default {
        components: {
            WTNGtt,
            WTNGttlabel
        },
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
                selFilterSetting: "",
                FilterSettingsOptions: [
                    { text: i18n.t('Modules.PMS.Settings.OnlyHidden'), value: 'OnlyHidden' },
                    { text: i18n.t('Modules.PMS.Settings.OnlyAdvanced'), value: 'OnlyAdvanced' },
                    { text: i18n.t('Modules.PMS.Settings.AllSettings'), value: 'AllSettings' }
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
            this.getFilterSettings();
            this.getServerSettings();
        },
        computed: {
            selectedServerAddress: function(){
                return this.$store.getters.getSelectedServerAddress;
            }
        },
        methods: {
            exportSettings: async function(){
                if (wtconfig.get('General.ExportPath', "") == "")
                {
                    log.info('ET: No output dir defined')
                    this.$bvToast.toast(this.$t("Common.ErrorNoOutDirMsg"), {
                    title: this.$t("Common.ErrorNoOutDirTitle"),
                    autoHideDelay: 3000,
                    solid: true,
                    variant: 'primary',
                    toaster: 'b-toaster-bottom-right'
                    })
                    return
                }
                log.info(`Export Group Settings: ${this.selSection}`);
                const path = require('path');
                const dirPath = path.join(i18n.t("Modules.PMS.Name"), i18n.t("Modules.PMS.Settings.Settings"));
                const outFile = await pmssettings.exportSettings({Module: dirPath, Grp: this.selSection, Data: this.$store.getters.getPMSSettings});
                const bodyStr = i18n.t("Modules.PMS.ExportDoneBody", [outFile]);
                this.$bvToast.toast(bodyStr, {
                    title: this.$t("Modules.PMS.ExportDoneTitle"),
                    autoHideDelay: 400000,
                    solid: true,
                    variant: 'primary',
                    toaster: 'b-toaster-bottom-right'
                });
            },
            exportAllSettings: async function(){
                if (wtconfig.get('General.ExportPath', "") == "")
                {
                    log.info('ET: No output dir defined')
                    this.$bvToast.toast(this.$t("Common.ErrorNoOutDirMsg"), {
                    title: this.$t("Common.ErrorNoOutDirTitle"),
                    autoHideDelay: 3000,
                    solid: true,
                    variant: 'primary',
                    toaster: 'b-toaster-bottom-right'
                    })
                    return
                }
                log.info(`Export All Settings: ${this.selSection}`);
                const path = require('path');
                const dirPath = path.join(i18n.t("Modules.PMS.Name"), i18n.t("Modules.PMS.Settings.Settings"));
                const outFile = await pmssettings.exportSettings({Module: dirPath, Grp:'All', Data: this.$store.getters.getPMSSettings});
                const bodyStr = i18n.t("Modules.PMS.ExportDoneBody", [outFile]);
                this.$bvToast.toast(bodyStr, {
                    title: this.$t("Modules.PMS.ExportDoneTitle"),
                    autoHideDelay: 400000,
                    solid: true,
                    variant: 'primary',
                    toaster: 'b-toaster-bottom-right'
                });
            },
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
            async changeFilterSetting() {
                log.debug('Changed FilterSetting');
                wtconfig.set('PMS.FilterSetting', this.selFilterSetting);
                await this.getServerSettings();
                this.updateTbl(this.selSection);
            },
            getFilterSettings() {
                this.selFilterSetting = wtconfig.get('PMS.FilterSetting', 'AllSettings');
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
