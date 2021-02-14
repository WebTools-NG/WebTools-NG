<template>
  <b-container fluid>
    <div class="col-lg-10 col-md-12 col-xs-12">
        <h1>{{ $t("Modules.GlobalSettings.Title") }}</h1>
        <p>{{ $t("Modules.GlobalSettings.Description") }}</p>
        <div>
        <b-input-group id="exportDir" :prepend="$t('Common.ExportDir')" class="mt-3">                    
            <b-form-input id="exportDirbox" type="text" name="exportDirbox" v-model="ExportDirVal" :disabled=true v-bind:placeholder="$t('Common.ExportDir')" />
            <b-input-group-append>                
                <b-button variant="info" v-on:click="browse">{{ $t("Common.Browse") }}</b-button>
            </b-input-group-append>
        </b-input-group>        
        </div>
        
       
        
            
        <b-input-group id="TimeOutGrp" :prepend="$t('Modules.GlobalSettings.TimeOut')" class="mt-3">
            <b-form-input id="TimeOut" name="TimeOut" type="text" class="form-control" v-model="TimeOut" :disabled=false :maxlength=2 @change="setTimeOut()"></b-form-input>
        </b-input-group>

        <b-input-group id="LogLevelGrp" :prepend="$t('Modules.GlobalSettings.LogLevelFile')" class="mt-3">
            <b-tooltip target="LogLevelGrp" triggers="hover">
              {{ $t('Modules.GlobalSettings.RestartNeeded') }}
            </b-tooltip>
            <b-form-select id="LogLevel" name="LogLevel" type="text" class="form-control" v-model="LogLevel" :disabled=false :maxlength=2 v-on:change="setLogLevel" :options="logLevels"></b-form-select>
        </b-input-group>  

        <b-input-group id="LogLevelConsoleGrp" :prepend="$t('Modules.GlobalSettings.LogLevelConsole')" class="mt-3">
            <b-tooltip target="LogLevelConsoleGrp" triggers="hover">
              {{ $t('Modules.GlobalSettings.RestartNeeded') }}
            </b-tooltip>
            <b-form-select id="LogLevelConsole" name="LogLevelConsole" type="text" class="form-control" v-model="LogLevelConsole" :disabled=false :maxlength=2 v-on:change="setLogLevelConsole" :options="logLevels"></b-form-select>
        </b-input-group>

        <b-input-group id="LogLevelSizeGrp" :prepend="$t('Modules.GlobalSettings.LogSize')" class="mt-3">
            <b-tooltip target="LogLevelSizeGrp" triggers="hover">
              {{ $t('Modules.GlobalSettings.RestartNeeded') }}
            </b-tooltip>
            <b-form-select id="LogLevelSize" name="LogLevelSize" type="text" class="form-control" v-model="LogLevelSize" :disabled=false :maxlength=4 v-on:change="setLogLevelSize" :options="LogLevelSizes"></b-form-select>
        </b-input-group>   

        <b-input-group id="BetaTesterGrp" :prepend="$t('Modules.GlobalSettings.BetaTester')" class="mt-3">
            <b-tooltip target="BetaTesterGrp" triggers="hover">
              {{ $t('Modules.GlobalSettings.TTBetaTester') }}
            </b-tooltip>
            <b-form-select id="BetaTester" name="BetaTester" type="text" class="form-control" v-model="BetaTester" :disabled=false :maxlength=2 v-on:change="setBeta" :options="BetaLevels"></b-form-select>
        </b-input-group>

        <b-input-group id="Update" :prepend="$t('Modules.GlobalSettings.Update')" class="mt-3">
            <b-tooltip target="Update" triggers="hover">
              {{ $t('Modules.GlobalSettings.TTUpdate') }}
            </b-tooltip>
            <b-form-select id="Update" name="Update" type="text" class="form-control" v-model="Update" :disabled=false :maxlength=2 v-on:change="setUpdate" :options="UpdateLevels">
                {{ this.getUpdate() }}
            </b-form-select>
        </b-input-group>

    </div>
  </b-container>
</template>

<script>
    const log = require("electron-log");
    console.log = log.log;
    import {wtutils, wtconfig, dialog} from '../General/wtutils';
    import i18n from '../../../i18n';
    
    wtutils, dialog, i18n

    export default {         
        data() {            
            return {
                ExportDirVal: wtconfig.get('General.ExportPath', i18n.t('Common.ExportDir')),                
                TimeOut: wtconfig.get('PMS.TimeOut'),
                LogLevel: wtconfig.get('Log.fileLevel'),
                LogLevelConsole: wtconfig.get('Log.consoleLevel'),
                LogLevelSize: this.getLogFileSize(),
                BetaTester: this.getBeta(),
                Update: this.getUpdate()
            }
        },
        methods: {
            browse: function(){
                log.debug('Start browsing for Export Directory');
                const exportDir = dialog.OpenDirectory( i18n.t("Common.ExportDir"), i18n.t("Common.Ok"));                
                if (exportDir)
                {
                    wtconfig.set('General.ExportPath', exportDir[0]);
                    this.ExportDirVal = exportDir[0];          
                    log.debug(`Selected Directory is ${exportDir}`);
                    if (!wtutils.ExportDirPresent)
                    {
                        console.log('ged1 globalsetting dir error')
                        this.ExportDirVal = '*** ERROR ***';
                    }                    
                    else
                    {
                        console.log('ged123 globalsetting dir ok')
                    }
                }               
            },
            factoryReset() {
                // Doing a factory reset
                log.warn('Doing a factory reset');                
                require('electron').remote.app.relaunch();
                require('electron').remote.app.quit();
            },
            getUpdate: function(){                
                if (wtconfig.get('Update.Update', true)){                    
                    return i18n.t('Modules.GlobalSettings.True')
                }
                else{                    
                    return i18n.t('Modules.GlobalSettings.False')
                }
            },
            getBeta: function(){                
                if (wtconfig.get('Update.Beta', false)){                    
                    return i18n.t('Modules.GlobalSettings.True')
                }
                else{                    
                    return i18n.t('Modules.GlobalSettings.False')
                }
            },
            setTimeOut: function(){
                wtconfig.set('PMS.TimeOut', this.TimeOut)
            },
            setLogLevel: function(value){                
                log.info(`Log file level set to ${value}`)
                wtconfig.set('Log.fileLevel', value)
            },
            setBeta: function(value){                
                log.info(`Beta level set to ${value}`);                
                wtconfig.set('Update.Beta', value == i18n.t('Modules.GlobalSettings.True'));
            },
            setUpdate: function(value){                
                log.info(`Update set to ${value}`);                
                wtconfig.set('Update.Update', value == i18n.t('Modules.GlobalSettings.True'));
            },
            setLogLevelConsole: function(value){                
                log.info(`Log Console level set to ${value}`);
                wtconfig.set('Log.consoleLevel', value);
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
                    default:
                        logSizeDisp = '1Mb';
                }
                return logSizeDisp;
            },
            setLogLevelSize: function(value){                
                let size = ''
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
                    default:
                        size = "1048576"                
                }
                wtconfig.set('Log.maxSize', size);

            }
        },
        computed: {            
            logLevels: function() {
                const options = ['error', 'warn', 'info', 'verbose', 'debug', 'silly'];
                return options;
            },
            LogLevelSizes: function() {
                const options = ['1Mb', '2Mb', '4Mb', '8Mb', '10Mb', '20Mb'];
                return options;
            },
            BetaLevels: function() {
                const options = [i18n.t('Modules.GlobalSettings.True'), i18n.t('Modules.GlobalSettings.False')];
                return options;
            },
            UpdateLevels: function() {
                const options = [i18n.t('Modules.GlobalSettings.True'), i18n.t('Modules.GlobalSettings.False')];
                return options;
            },            
        }        
    }
</script>