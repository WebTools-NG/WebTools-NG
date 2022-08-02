<template>
  <b-container class="m-2 mt-2">
    <div>   <!-- Title and desc -->
      <h2>
        {{ $t(`Modules.GlobalSettings.Title`) }}
      </h2>
      <h5>{{ $t(`Modules.GlobalSettings.Description`) }}</h5>
      <p>{{ $t("Common.Settings.Global.Info") }}</p>
    </div>
    <br>
    <div class="text-center">    <!-- Link menu -->
      <h5>
        <b-link id="general" to="/settings/settingsgeneral">* {{ $t("Common.Settings.General.Name") }} </b-link>
        <WTNGtt tt="Common.Settings.Global.ttGeneral" size="20px"></WTNGtt>
        <br>
        <br>
        <b-link id="export" to="/settings/export">* {{ $t("Common.Settings.Export.Name") }} </b-link>
        <WTNGtt tt="Common.Settings.Global.ttExport" size="20px"></WTNGtt>
        <br>
        <br>
        <b-link id="pms" to="/settings/settingspms">*  {{ $t("Common.Settings.PMS.Name") }} </b-link>
        <WTNGtt tt="Common.Settings.Global.ttPMS" size="20px"></WTNGtt>
        <br>
        <br>
        <b-link id="libmap" to="/settings/libmapping">* {{ $t("Common.Settings.LibMapping.Name") }}</b-link>
        <WTNGtt tt="Common.Settings.LibMapping.Name" size="20px"></WTNGtt>
      </h5>
    </div>
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
  </b-container>
</template>

<script>
    import { wtutils } from '../../General/wtutils';
    import WTNGtt from '../../General/wtng-tt.vue'
    const log = require("electron-log");
    console.log = log.log;
    export default {
        components: {
            WTNGtt
        },
        methods: {
            confirmFactoryReset(){
                this.$refs['confirmFactoryReset'].show();
            },
            factoryResetClose() {
                this.$refs['confirmFactoryReset'].hide();
            },
            remFile( file ){
                const fs = require('fs');
                if (fs.existsSync(file)) {
                    log.debug(`[Settings.vue] (remFile) - Found file: ${file}`);
                    try {
                            log.debug(`[Settings.vue] (remFile) - Removing file: ${file}`);
                            fs.unlinkSync( file );
                        }
                    catch (e) {
                        log.error(`[Settings.vue] (remFile) - Error removing ${file} was ${e}`);
                    }
                }
            },
            remDir( dir ){
                const fs = require('fs');
                if (fs.existsSync(dir)) {
                    log.debug(`[Settings.vue] (remDir) - Found directory: ${dir}`);
                    var rimraf = require("rimraf");
                    try {
                            log.debug(`[Settings.vue] (remDir) - Removing directory: ${dir}`);
                            rimraf.sync( dir );
                        }
                    catch (e) {
                        log.error(`[Settings.vue] (remDir) - Error removing ${dir} was ${e}`);
                    }
                }
            },
            factoryReset() {
                // Doing a factory reset
                log.warn('Doing a factory reset');
                var fs = require('fs');
                const postfix = '-' + new Date().toISOString().replaceAll('-','').replaceAll(':','').split('.')[0]+"Z";
                // Make backup of conf file
                fs.copyFileSync(wtutils.ConfigFileName, wtutils.ConfigFileName + postfix);

                const home = wtutils.Home;
                const path = require('path');

                // Remove directories requrcively
                this.remDir(path.join(home, 'blob_storage'));
                this.remDir(path.join(home, 'Cache'));
                this.remDir(path.join(home, 'Code Cache'));
                this.remDir(path.join(home, 'Crash Reports'));
                this.remDir(path.join(home, 'Dictionaries'));
                this.remDir(path.join(home, 'extensions'));
                this.remDir(path.join(home, 'GPUCache'));
                this.remDir(path.join(home, 'IndexedDB'));
                this.remDir(path.join(home, 'locales'));
                this.remDir(path.join(home, 'Local Storage'));
                this.remDir(path.join(home, 'Partitions'));
                this.remDir(path.join(home, 'Session Storage'));
                this.remDir(path.join(home, 'WebTools-NG'));

                // Remove files
                this.remFile(wtutils.ConfigFileName);
                this.remFile(path.join(home, 'Cookies'));
                this.remFile(path.join(home, 'Cookies-journal'));
                this.remFile(path.join(home, 'DevTools Extensions'));
                this.remFile(path.join(home, 'Network Persistent State'));
                this.remFile(path.join(home, 'Preferences'));
                this.remFile(path.join(home, 'TransportSecurity'));
                this.remDir(path.join(home, 'logs'));
                // Shut down
                const {ipcRenderer} = require('electron');
                ipcRenderer.send('close-me');
            }
        }
    }
</script>
