<template>
  <b-container fluid>
    <div class="col-lg-10 col-md-12 col-xs-12">
        <h1>{{ $t("Common.Settings.Export.Name") }}</h1>
        <p>{{ $t("Common.Settings.Export.Description") }}</p>
    </div>
    <br>

    <b-input-group id="exportDir" :prepend="$t('Common.ExportDir')" class="mt-3">
      <b-form-input id="exportDirbox" type="text" name="exportDirbox" v-model="ExportDirVal" :disabled=true v-bind:placeholder="$t('Common.ExportDir')" />
      <b-input-group-append>
          <b-button variant="info" v-on:click="browse">{{ $t("Common.Browse") }}</b-button>
      </b-input-group-append>
    </b-input-group>

    <b-input-group id="LocalDateTimeGrp" :prepend="$t('Modules.GlobalSettings.LocalDateTime')" class="mt-3">
      <b-form-select id="LocalDateTime" name="LocalDateTime" type="text" class="form-control" v-model="LocalDateTime" :disabled=false :maxlength=2 v-on:change="setPrefs($event, 'General.DateTimeFormat')" :options="LocalDateTimeOptions"></b-form-select>
    </b-input-group>

    <b-input-group id="DateOptionGrp" :prepend="$t('Modules.GlobalSettings.DateStyle')" class="mt-3">
            <b-form-select id="DateOption" name="DateOption" type="text" class="form-control" v-model="DateOption" :disabled=false :maxlength=2 v-on:change="setPrefs($event, 'General.DateOption')" :options="DateTimeOptions"></b-form-select>
    </b-input-group>

    <b-input-group id="TimeOptionGrp" :prepend="$t('Modules.GlobalSettings.TimeStyle')" class="mt-3">
            <b-form-select id="TimeOption" name="TimeOption" type="text" class="form-control" v-model="TimeOption" :disabled=false :maxlength=2 v-on:change="setPrefs($event, 'General.TimeOption')" :options="DateTimeOptions"></b-form-select>
    </b-input-group>

    <b-input-group id="ArraySepGrp" :prepend="$t('Modules.ET.Settings.ArraySep')" class="mt-3">
      <b-form-input id="ArraySep" name="ArraySep" type="text" class="form-control" v-model="ArraySep" :disabled=false :maxlength=1 @change="setArraySep()"></b-form-input>
    </b-input-group>

    <b-input-group id="setTextQualifierCSVGrp" :prepend="$t('Modules.ET.Settings.QualifierCSV')" class="mt-3">
        <b-form-input id="TextQualifierCSV" name="TextQualifierCSV" type="text" class="form-control" v-model="TextQualifierCSV" :disabled=false :maxlength=1 @change="setTextQualifierCSV()"></b-form-input>
    </b-input-group>

    <b-input-group id="NotAvailIndicatorGrp" :prepend="$t('Modules.ET.Settings.NotAvailIndicator')" class="mt-3">
      <b-form-input id="NotAvailIndicator" name="NotAvailIndicator" type="text" class="form-control" v-model="NotAvailIndicator" :disabled=false @change="setNotAvailIndicator()"></b-form-input>
    </b-input-group>

    <b-input-group id="ColumnSepGrp" :prepend="$t('Modules.ET.Settings.ColumnSep')" class="mt-3">
      <b-form-input id="ColumnSep" name="ColumnSep" type="text" class="form-control" v-model="ColumnSep" :disabled=false :maxlength=1 @change="setColumnSep"></b-form-input>
    </b-input-group>

    <b-input-group id="ChReturn" :prepend="$t('Modules.ET.Settings.ChReturn')" class="mt-3">
      <b-tooltip target="ChReturn" triggers="hover">
        {{ $t('Modules.ET.Settings.ChReturn_TT') }}
      </b-tooltip>
      <b-form-input id="ChReturn" name="ChReturn" type="text" class="form-control" v-model="ChReturn" :disabled=false @change="setChReturn()"></b-form-input>
    </b-input-group>

    <b-input-group id="ChNewLine" :prepend="$t('Modules.ET.Settings.ChNewLine')" class="mt-3">
      <b-tooltip target="ChNewLine" triggers="hover">
        {{ $t('Modules.ET.Settings.ChNewLine_TT') }}
      </b-tooltip>
      <b-form-input id="ChNewLine" name="ChNewLine" type="text" class="form-control" v-model="ChNewLine" :disabled=false @change="setChNewLine()"></b-form-input>
    </b-input-group>

    <br>
    <!-- Buttons -->
    <div class="buttons">
        <!-- Buttons -->
        <div id="buttons" class="text-center">
            <b-button-group >
                <b-button variant="success" class="mr-1" @click="jumpToSettings"> {{ $t('Common.Settings.Return') }} </b-button>
            </b-button-group>
        </div>
    </div>

  </b-container>
</template>

<script>
  import { wtconfig, wtutils, dialog } from '../../General/wtutils';
  import { time } from '../../General/time';
  import i18n from '../../../../i18n';
  const log = require("electron-log");
  export default {
      data() {
        return {
          ChNewLine: wtconfig.get('ET.ChNewLine', '<NEWLINE>'),
          ChReturn: wtconfig.get('ET.ChReturn', '<RETURN>'),
          ColumnSep: '',
          NotAvailIndicator: wtconfig.get('ET.NotAvail', 'N/A'),
          TextQualifierCSV: wtconfig.get('ET.TextQualifierCSV', '"'),
          ArraySep: wtconfig.get('ET.ArraySep'),
          ExportDirVal: wtconfig.get('General.ExportPath', i18n.t('Common.ExportDir')),
          LocalDateTime: wtconfig.get('General.DateTimeFormat'),
          LocalDateTimeOptions: time.countries,
          DateTimeOptions: [ i18n.t("Common.DateTime.Full"), i18n.t("Common.DateTime.Long"), i18n.t("Common.DateTime.Medium"), i18n.t("Common.DateTime.Short")],
          DateOption: wtconfig.get('General.DateOption'),
          TimeOption: wtconfig.get('General.TimeOption')


        };
    },
    created() {
      log.info(`[SettingsExport.vue] (created) - SettingsExport Created`);
      if (wtconfig.get('ET.ColumnSep') == '\t')
      {
        this.ColumnSep = '{TAB}';
      }
      else
      {
        this.ColumnSep = wtconfig.get('ET.ColumnSep');
      }
    },
    computed: {
    },
    methods: {
      setChReturn: function(){
        wtconfig.set('ET.ChReturn', this.ChReturn)
      },
      setChNewLine: function(){
        wtconfig.set('ET.ChNewLine', this.ChNewLine)
      },
      setColumnSep(val){
        if (val.length > 1)
        {
          this.$bvToast.toast(this.$t("Modules.ET.ErrorBadSep"), {
            title: this.$t("Modules.ET.ErrorBadSepTitle"),
            autoHideDelay: 3000,
            solid: true,
            variant: 'primary',
            toaster: 'b-toaster-bottom-center'
          });
        }
        else
        {
          if (val == '9')
          {
            wtconfig.set('ET.ColumnSep', '\t')
            this.ColumnSep = '{TAB}'
          }
          else
          {
            wtconfig.set('ET.ColumnSep', this.ColumnSep)
          }
        }
      },
      browse: function(){
        log.debug(`[SettingsExport.vue] (browse) - Start browsing for Export Directory`);
        const exportDir = dialog.OpenDirectory( i18n.t("Common.ExportDir"), i18n.t("Common.Ok"));
        if (exportDir)
        {
          wtconfig.set('General.ExportPath', exportDir[0]);
          this.ExportDirVal = exportDir[0];
          log.debug(`[SettingsExport.vue] (browse) - Selected Directory is ${exportDir}`);
          if (!wtutils.ExportDirPresent)
          {
              this.ExportDirVal = '*** ERROR ***';
          }
        }
      },
      setArraySep: function(){
        wtconfig.set('ET.ArraySep', this.ArraySep)
      },
      setTextQualifierCSV: function(){
        wtconfig.set('ET.TextQualifierCSV', this.TextQualifierCSV)
      },
      setNotAvailIndicator: function(){
        wtconfig.set('ET.NotAvail', this.NotAvailIndicator)
      },

      // Update conf file
      setPrefs: function(value, name){
        log.info(`[SettingsPMS.vue] (setPrefs) - Update prefs for ${name} set to ${value}`);
        wtconfig.set(name, value);
      },
      // Return to main Settings
      jumpToSettings(){
          this.$router.push({ name: 'settingsGlobal' })
      }
    }
  }

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
#sync-button {
  margin-left: 1em;
}
</style>
