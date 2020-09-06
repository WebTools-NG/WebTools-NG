<template>
  <b-container fluid>
    <div class="col-lg-10 col-md-12 col-xs-12">
        <h2>{{ $t("Modules.GlobalSettings.Title") }}<br>
            <small>{{ $t("Modules.GlobalSettings.Description") }}</small>
        </h2>
        <b-input-group id="TimeOutGrp" :prepend="$t('Modules.GlobalSettings.TimeOut')" class="mt-3">
            <b-form-input id="TimeOut" name="TimeOut" type="text" class="form-control" v-model="TimeOut" :disabled=false :maxlength=2 @change="setTimeOut()"></b-form-input>
        </b-input-group>

        <b-input-group id="LogLevelGrp" :prepend="$t('Modules.GlobalSettings.LogLevelFile')" class="mt-3">
            <b-tooltip target="LogLevelGrp" triggers="hover">
              {{ $t('Modules.GlobalSettings.RestartNeeded') }}
            </b-tooltip>
            <b-form-select id="LogLevel" name="LogLevel" type="text" class="form-control" v-model="LogLevel" :disabled=false :maxlength=2 v-on:change="setLogLevel" :options="logLevels"></b-form-select>
        </b-input-group>                                                        

        
    </div>
  </b-container>
</template>

<script>
    const log = require("electron-log");
    import {wtutils, wtconfig, dialog} from '../wtutils';
    import i18n from '../i18n';
    

    log, wtutils, dialog, i18n

    export default {
        data() {            
            return {
                TimeOut: wtconfig.get('PMS.TimeOut'),
                LogLevel: wtconfig.get('Log.fileLevel')

            }
        },
        methods: {
            setTimeOut: function(){
                wtconfig.set('PMS.TimeOut', this.TimeOut)
            },
            setLogLevel: function(value){
                console.log('Ged value: ' + JSON.stringify( value))
                log.info(`Log file level set to ${value}`)
                wtconfig.set('Log.fileLevel', value)
            }

        },
        computed: {
            logLevels: function() {
                const options = ['debug', 'error', 'info', 'verbose']
                return options
            }

        }        
    }
</script>