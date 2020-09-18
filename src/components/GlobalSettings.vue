<template>
  <b-container fluid>
    <div class="col-lg-10 col-md-12 col-xs-12">
        <h1>{{ $t("Modules.GlobalSettings.Title") }}</h1>
        <p>{{ $t("Modules.GlobalSettings.Description") }}</p>
        
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

        <!--                                                       
        
        <br>
        <br>        
        <div class="text-center my-3">
            <b-button id="btnReset" variant="danger" v-on:click="factoryReset">
                {{ $t("Modules.GlobalSettings.FactoryReset") }}
            </b-button>
            <b-tooltip target="btnReset" triggers="hover">
                {{ $t('Modules.GlobalSettings.FactoryResetWarning') }}
            </b-tooltip>

        </div> -->

    </div>
  </b-container>
</template>

<script>
    const log = require("electron-log");
    console.log = log.log;
    import {wtutils, wtconfig, dialog} from '../wtutils';
    import i18n from '../i18n';
    
    

    log, wtutils, dialog, i18n

    export default {
        data() {            
            return {
                TimeOut: wtconfig.get('PMS.TimeOut'),
                LogLevel: wtconfig.get('Log.fileLevel'),
                LogLevelConsole: wtconfig.get('Log.consoleLevel'),
                LogLevelSize: this.getLogFileSize()
            }
        },
        methods: {
            factoryReset() {
                // Doing a factory reset
                log.warn('Doing a factory reset');
                

                require('electron').remote.app.relaunch();
                require('electron').remote.app.quit();


            },
            setTimeOut: function(){
                wtconfig.set('PMS.TimeOut', this.TimeOut)
            },
            setLogLevel: function(value){                
                log.info(`Log file level set to ${value}`)
                wtconfig.set('Log.fileLevel', value)
            },
            setLogLevelConsole: function(value){                
                log.info(`Log Console level set to ${value}`)
                wtconfig.set('Log.consoleLevel', value)
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
                const options = ['error', 'warn', 'info', 'verbose', 'debug', 'silly']
                return options
            },
            LogLevelSizes: function() {
                const options = ['1Mb', '2Mb', '4Mb', '8Mb', '10Mb', '20Mb']
                return options
            }            
        }        
    }
</script>