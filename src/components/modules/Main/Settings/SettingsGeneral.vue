<template>
  <b-container class="m-2 mt-2">
    <div>   <!-- Title and desc -->
      <h2>
        {{ $t(`Common.Settings.General.Name`) }}
      </h2>
      <h5>{{ $t(`Common.Settings.General.Description`) }}</h5>
    </div>
    <br>
    <b-input-group id="LogLevelGrp" :prepend="$t('Modules.GlobalSettings.LogLevelFile')" class="mt-3">
      <b-form-select id="LogLevel" name="LogLevel" type="text" class="form-control" v-model="LogLevel" :disabled=false :maxlength=2 v-on:change="setPrefs($event, 'Log.fileLevel')" :options="logLevels"></b-form-select>
      <WTNGtt tt="Modules.GlobalSettings.RestartNeeded" size="20px"></WTNGtt>
    </b-input-group>

    <b-input-group id="LogLevelConsoleGrp" :prepend="$t('Modules.GlobalSettings.LogLevelConsole')" class="mt-3">
      <b-form-select id="LogLevelConsole" name="LogLevelConsole" type="text" class="form-control" v-model="LogLevelConsole" :disabled=false :maxlength=2 v-on:change="setPrefs($event, 'Log.consoleLevel')" :options="logLevels"></b-form-select>
      <WTNGtt tt="Modules.GlobalSettings.RestartNeeded" size="20px"></WTNGtt>
    </b-input-group>

    <b-input-group id="LogLevelSizeGrp" :prepend="$t('Modules.GlobalSettings.LogSize')" class="mt-3">
        <b-form-select id="LogLevelSize" name="LogLevelSize" type="text" class="form-control" v-model="LogLevelSize" :disabled=false :maxlength=4 v-on:change="setLogLevelSize" :options="LogLevelSizes"></b-form-select>
        <WTNGtt tt="Modules.GlobalSettings.RestartNeeded" size="20px"></WTNGtt>
    </b-input-group>

    <b-input-group id="BetaTesterGrp" :prepend="$t('Modules.GlobalSettings.BetaTester')" class="mt-3">
        <b-form-select id="BetaTester" name="BetaTester" type="text" class="form-control" v-model="BetaTester" :disabled=false :maxlength=2 v-on:change="setBeta" :options="BetaLevels"></b-form-select>
        <WTNGtt tt="Modules.GlobalSettings.TTBetaTester" size="20px"></WTNGtt>
    </b-input-group>

    <b-input-group id="Update" :prepend="$t('Modules.GlobalSettings.Update')" class="mt-3">
        <b-form-select id="Update" name="Update" type="text" class="form-control" v-model="Update" :disabled=false :maxlength=2 v-on:change="setUpdate" :options="UpdateLevels">
            {{ this.getUpdate() }}
        </b-form-select>
        <WTNGtt tt="Modules.GlobalSettings.TTUpdate" size="20px"></WTNGtt>
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
  import i18n from '../../../../i18n';
  import { wtconfig } from '../../General/wtutils';
  import WTNGtt from '../../General/wtng-tt.vue';

  const log = require("electron-log");
  export default {
    components: {
            WTNGtt
        },
    data() {
      return {
        LogLevel: wtconfig.get('Log.fileLevel'),
        LogLevelConsole: wtconfig.get('Log.consoleLevel'),
        LogLevelSize: this.getLogFileSize(),
        BetaTester: this.getBeta(),
        Update: this.getUpdate()
      };
    },
    created() {
      log.info(`[SettingsGeneral.vue] (created) - SettingsGeneral Created`);
    },
    computed: {
      BetaLevels: function() {
        const options = [i18n.t('Modules.GlobalSettings.True'), i18n.t('Modules.GlobalSettings.False')];
        return options;
      },
      logLevels: function() {
        const options = ['error', 'warn', 'info', 'verbose', 'debug', 'silly'];
        return options;
      },
      LogLevelSizes: function() {
        const options = ['1Mb', '2Mb', '4Mb', '8Mb', '10Mb', '20Mb', '40Mb', '60Mb', '100Mb', '200Mb'];
        return options;
      },
      UpdateLevels: function() {
        const options = [i18n.t('Modules.GlobalSettings.True'), i18n.t('Modules.GlobalSettings.False')];
        return options;
      }
    },
    methods: {
      setUpdate: function(value){
        log.info(`[SettingsGeneral.vue] (setUpdate) - Update set to ${value}`);
        wtconfig.set('Update.Update', value == i18n.t('Modules.GlobalSettings.True'));
      },
      getUpdate: function(){
        if (wtconfig.get('Update.Update', true)){
            return i18n.t('Modules.GlobalSettings.True')
        }
        else{
            return i18n.t('Modules.GlobalSettings.False')
        }
      },
      setBeta: function(value){
        log.info(`[SettingsGeneral.vue] (setBeta) - Beta level set to ${value}`);
        wtconfig.set('Update.Beta', value == i18n.t('Modules.GlobalSettings.True'));
      },
      getBeta: function(){
        if (wtconfig.get('Update.Beta', false)){
            return i18n.t('Modules.GlobalSettings.True')
        }
        else{
            return i18n.t('Modules.GlobalSettings.False')
        }
      },
      setLogLevelSize: function(value){
        let size = '';
        switch(value)
        {
          case "1Mb":
            size = "1048576";
            break;
          case "2Mb":
            size = "2097152";
            break;
          case "4Mb":
            size = "4194304";
            break;
          case "8Mb":
            size = "8388608";
            break;
          case "10Mb":
            size = "10485760";
            break;
          case "20Mb":
            size = "20971520";
            break;
          case "40Mb":
            size = "41943040";
            break;
          case "60Mb":
            size = "62914560";
            break;
          case "100Mb":
            size = "104857600";
            break;
          case "200Mb":
            size = "209715200";
            break;
          default:
            size = "1048576"
        }
        wtconfig.set('Log.maxSize', size);
      },
      getLogFileSize: function(){
                const logSizeBytes = wtconfig.get('Log.maxSize');
                let logSizeDisp  = '';
                switch (logSizeBytes)
                {
                    case '1048576':
                      logSizeDisp = '1Mb';
                      break;
                    case '2097152':
                      logSizeDisp = '2Mb';
                      break;
                    case '4194304':
                      logSizeDisp = '4Mb';
                      break;
                    case '8388608':
                      logSizeDisp = '8Mb';
                      break;
                    case '10485760':
                      logSizeDisp = '10Mb';
                      break;
                    case '20971520':
                      logSizeDisp = '20Mb';
                      break;
                    case '41943040':
                      logSizeDisp = '40Mb';
                      break;
                    case '62914560':
                      logSizeDisp = '60Mb';
                      break;
                    case '104857600':
                      logSizeDisp = '100Mb';
                      break;
                    case '209715200':
                      logSizeDisp = '200Mb';
                      break;
                    default:
                      logSizeDisp = '1Mb';
                }
                return logSizeDisp;
            },
      // Update conf file
      setPrefs: function(value, name){
        log.info(`[SettingsGeneral.vue] (setPrefs) - Update prefs for ${name} set to ${value}`);
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
