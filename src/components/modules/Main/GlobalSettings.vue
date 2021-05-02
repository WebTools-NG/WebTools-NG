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
            <b-form-select id="LogLevel" name="LogLevel" type="text" class="form-control" v-model="LogLevel" :disabled=false :maxlength=2 v-on:change="setPrefs($event, 'Log.fileLevel')" :options="logLevels"></b-form-select>
        </b-input-group>

        <b-input-group id="LogLevelConsoleGrp" :prepend="$t('Modules.GlobalSettings.LogLevelConsole')" class="mt-3">
            <b-tooltip target="LogLevelConsoleGrp" triggers="hover">
              {{ $t('Modules.GlobalSettings.RestartNeeded') }}
            </b-tooltip>
            <b-form-select id="LogLevelConsole" name="LogLevelConsole" type="text" class="form-control" v-model="LogLevelConsole" :disabled=false :maxlength=2 v-on:change="setPrefs($event, 'Log.consoleLevel')" :options="logLevels"></b-form-select>
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

        <b-input-group id="ContainerSizeMovie" :prepend="$t('Modules.GlobalSettings.ContainerSizeMovie')" class="mt-3">
            <b-tooltip target="ContainerSizeMovie" triggers="hover">
              {{ $t('Modules.GlobalSettings.TTContainerSize') }}
            </b-tooltip>
            <b-form-select id="ContainerSizeMovie" name="ContainerSizeMovie" type="text" class="form-control" v-model="ContainerSizeMovie" :options="ContainerSizes" :disabled=false v-on:change="setPrefs($event, 'PMS.ContainerSize.1')"></b-form-select>
        </b-input-group>

        <b-input-group id="ContainerSizeShow" :prepend="$t('Modules.GlobalSettings.ContainerSizeShow')" class="mt-3">
            <b-tooltip target="ContainerSizeShow" triggers="hover">
              {{ $t('Modules.GlobalSettings.TTContainerSize') }}
            </b-tooltip>
            <b-form-select id="ContainerSizeShow" name="ContainerSizeShow" type="text" class="form-control" v-model="ContainerSizeShow" :options="ContainerSizes" :disabled=false v-on:change="setPrefs($event, 'PMS.ContainerSize.2')"></b-form-select>
        </b-input-group>

        <b-input-group id="ContainerSizeEpisode" :prepend="$t('Modules.GlobalSettings.ContainerSizeEpisode')" class="mt-3">
            <b-tooltip target="ContainerSizeEpisode" triggers="hover">
              {{ $t('Modules.GlobalSettings.TTContainerSize') }}
            </b-tooltip>
            <b-form-select id="ContainerSizeEpisode" name="ContainerSizeEpisode" type="text" class="form-control" v-model="ContainerSizeEpisode" :options="ContainerSizes" :disabled=false v-on:change="setPrefs($event, 'PMS.ContainerSize.4')"></b-form-select>
        </b-input-group>

        <b-input-group id="ContainerSizeArtist" :prepend="$t('Modules.GlobalSettings.ContainerSizeArtist')" class="mt-3">
            <b-tooltip target="ContainerSizeArtist" triggers="hover">
              {{ $t('Modules.GlobalSettings.TTContainerSize') }}
            </b-tooltip>
            <b-form-select id="ContainerSizeArtist" name="ContainerSizeArtist" type="text" class="form-control" v-model="ContainerSizeArtist" :options="ContainerSizes" :disabled=false v-on:change="setPrefs($event, 'PMS.ContainerSize.8')"></b-form-select>
        </b-input-group>

        <b-input-group id="ContainerSizeAlbum" :prepend="$t('Modules.GlobalSettings.ContainerSizeAlbum')" class="mt-3">
            <b-tooltip target="ContainerSizeAlbum" triggers="hover">
              {{ $t('Modules.GlobalSettings.TTContainerSize') }}
            </b-tooltip>
            <b-form-select id="ContainerSizeAlbum" name="ContainerSizeAlbum" type="text" class="form-control" v-model="ContainerSizeAlbum" :options="ContainerSizes" :disabled=false v-on:change="setPrefs($event, 'PMS.ContainerSize.9')"></b-form-select>
        </b-input-group>

        <b-input-group id="ContainerSizeTrack" :prepend="$t('Modules.GlobalSettings.ContainerSizeTrack')" class="mt-3">
            <b-tooltip target="ContainerSizeTrack" triggers="hover">
              {{ $t('Modules.GlobalSettings.TTContainerSize') }}
            </b-tooltip>
            <b-form-select id="ContainerSizeTrack" name="ContainerSizeTrack" type="text" class="form-control" v-model="ContainerSizeTrack" :options="ContainerSizes" :disabled=false v-on:change="setPrefs($event, 'PMS.ContainerSize.10')"></b-form-select>
        </b-input-group>

        <b-input-group id="ContainerSizePhoto" :prepend="$t('Modules.GlobalSettings.ContainerSizePhoto')" class="mt-3">
            <b-tooltip target="ContainerSizePhoto" triggers="hover">
              {{ $t('Modules.GlobalSettings.TTContainerSize') }}
            </b-tooltip>
            <b-form-select id="ContainerSizePhoto" name="ContainerSizePhoto" type="text" class="form-control" v-model="ContainerSizePhoto" :options="ContainerSizes" :disabled=false v-on:change="setPrefs($event, 'PMS.ContainerSize.13')"></b-form-select>
        </b-input-group>

        <b-input-group id="ContainerSizePlaylist" :prepend="$t('Modules.GlobalSettings.ContainerSizePlaylist')" class="mt-3">
            <b-tooltip target="ContainerSizePlaylist" triggers="hover">
              {{ $t('Modules.GlobalSettings.TTContainerSize') }}
            </b-tooltip>
            <b-form-select id="ContainerSizePlaylist" name="ContainerSizePlaylist" type="text" class="form-control" v-model="ContainerSizePlaylist" :options="ContainerSizes" :disabled=false v-on:change="setPrefs($event, 'PMS.ContainerSize.15')"></b-form-select>
        </b-input-group>

        <b-input-group id="ContainerSizeLibraries" :prepend="$t('Modules.GlobalSettings.ContainerSizeLibraries')" class="mt-3">
            <b-tooltip target="ContainerSizeLibraries" triggers="hover">
              {{ $t('Modules.GlobalSettings.TTContainerSize') }}
            </b-tooltip>
            <b-form-select id="ContainerSizeLibraries" name="ContainerSizeLibraries" type="text" class="form-control" v-model="ContainerSizeLibraries" :options="ContainerSizes" :disabled=false v-on:change="setPrefs($event, 'PMS.ContainerSize.1002')"></b-form-select>
        </b-input-group>

        <b-input-group id="ContainerSizePlaylists" :prepend="$t('Modules.GlobalSettings.ContainerSizePlaylists')" class="mt-3">
            <b-tooltip target="ContainerSizePlaylists" triggers="hover">
              {{ $t('Modules.GlobalSettings.TTContainerSize') }}
            </b-tooltip>
            <b-form-select id="ContainerSizePlaylists" name="ContainerSizePlaylists" type="text" class="form-control" v-model="ContainerSizePlaylists" :options="ContainerSizes" :disabled=false v-on:change="setPrefs($event, 'PMS.ContainerSize.3001')"></b-form-select>
        </b-input-group>

        <!-- Factory Reset -->
        <b-modal ref="confirmFactoryReset" hide-footer v-bind:title="$t('Modules.GlobalSettings.FactoryResetConfirmTitle')" >
          <div class="d-block text-center">
              {{ $t('Modules.GlobalSettings.FactoryResetConfirmBody') }}
              {{ $t('Modules.GlobalSettings.FactoryResetConfirmBody2', [$t('Common.AppName')]) }}
          </div>
          <b-button class="mt-3" variant="info" block @click="factoryResetClose">{{ $t('Modules.GlobalSettings.FactoryResetBtnCancel') }}</b-button>
          <b-button class="mt-3" variant="danger" block @click="factoryReset">{{ $t('Modules.GlobalSettings.FactoryResetBtnOk') }}</b-button>
        </b-modal>
        <br>
        <br>
        <div id="buttons" class="text-center">
            <b-button-group >
                <b-button variant="danger" class="mr-1" @click="confirmFactoryReset">{{ $t('Modules.GlobalSettings.FactoryReset') }}</b-button>
            </b-button-group>
        </div>

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
                Update: this.getUpdate(),
                ContainerSizeMovie: wtconfig.get('PMS.ContainerSize.1'),
                ContainerSizeShow: wtconfig.get('PMS.ContainerSize.2'),
                ContainerSizeEpisode: wtconfig.get('PMS.ContainerSize.4'),
                ContainerSizeArtist: wtconfig.get('PMS.ContainerSize.8'),
                ContainerSizeAlbum: wtconfig.get('PMS.ContainerSize.9'),
                ContainerSizeTrack: wtconfig.get('PMS.ContainerSize.10'),
                ContainerSizePhoto: wtconfig.get('PMS.ContainerSize.13'),
                ContainerSizePlaylist: wtconfig.get('PMS.ContainerSize.15'),
                ContainerSizeLibraries: wtconfig.get('PMS.ContainerSize.1002'),
                ContainerSizePlaylists: wtconfig.get('PMS.ContainerSize.3001')
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
                        this.ExportDirVal = '*** ERROR ***';
                    }
                }
            },
            factoryResetClose() {
                this.$refs['confirmFactoryReset'].hide();
            },
            confirmFactoryReset(){
                this.$refs['confirmFactoryReset'].show();
            },
            factoryReset() {
                // Doing a factory reset
                log.warn('Doing a factory reset');
                var fs = require('fs');
                const postfix = '-' + new Date().toISOString().replaceAll('-','').replaceAll(':','').split('.')[0]+"Z";
                // Make backup of conf file
                fs.copyFileSync(wtutils.ConfigFileName, wtutils.ConfigFileName + postfix);
                var rimraf = require("rimraf");
                const home = wtutils.Home;
                const path = require('path');
                // Remove directories requrcively
                rimraf.sync(path.join(home, 'blob_storage'));
                rimraf.sync(path.join(home, 'Cache'));
                rimraf.sync(path.join(home, 'Code Cache'));
                rimraf.sync(path.join(home, 'Crash Reports'));
                rimraf.sync(path.join(home, 'Dictionaries'));
                rimraf.sync(path.join(home, 'extensions'));
                rimraf.sync(path.join(home, 'GPUCache'));
                rimraf.sync(path.join(home, 'IndexedDB'));
                rimraf.sync(path.join(home, 'locales'));
                rimraf.sync(path.join(home, 'Local Storage'));
                rimraf.sync(path.join(home, 'Partitions'));
                rimraf.sync(path.join(home, 'Session Storage'));
                rimraf.sync(path.join(home, 'WebTools-NG'));
                rimraf.sync(path.join(home, 'logs'));
                // Remove files
                fs.unlinkSync(wtutils.ConfigFileName);
                fs.unlinkSync(path.join(home, 'Cookies'));
                fs.unlinkSync(path.join(home, 'Cookies-journal'));
                //fs.unlinkSync(path.join(home, 'DevTools Extensions'));
                fs.unlinkSync(path.join(home, 'Network Persistent State'));
                fs.unlinkSync(path.join(home, 'Preferences'));
                fs.unlinkSync(path.join(home, 'TransportSecurity'));
                require('electron').remote.app.relaunch();
                require('electron').remote.app.exit();
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
            setBeta: function(value){
                log.info(`Beta level set to ${value}`);
                wtconfig.set('Update.Beta', value == i18n.t('Modules.GlobalSettings.True'));
            },
            setUpdate: function(value){
                log.info(`Update set to ${value}`);
                wtconfig.set('Update.Update', value == i18n.t('Modules.GlobalSettings.True'));
            },
            setPrefs: function(value, name){
                log.info(`Update prefs for ${name} set to ${value}`);
                wtconfig.set(name, value);
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
            ContainerSizes: function() {
                const options = [20, 30, 40, 50, 60, 70, 80, 90, 100];
                return options;
            },
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