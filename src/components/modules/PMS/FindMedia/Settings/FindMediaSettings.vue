<template>
    <b-container fluid>
        <div class="col-lg-10 col-md-12 col-xs-12">
            <br>
            <br>
            <h1>{{ $t("Modules.PMS.FindMedia.Settings.Name") }}</h1>
            <p>{{ $t("Modules.PMS.FindMedia.Settings.Description") }}</p>
            <br>
            <p>{{ $t("Modules.PMS.FindMedia.Settings.Note") }}</p>
        </div>
        <b-input-group id="ExtGrp" :prepend="$t('Modules.PMS.FindMedia.Settings.Ext')" class="mt-3">
            <b-form-textarea
                id="Ext" name="Ext" type="text" class="form-control" v-model="Ext" @change="setExt"
                rows="3"
                max-rows="3"
                >
            </b-form-textarea>
        </b-input-group>
        <b-input-group id="ignoreDirsGrp" :prepend="$t('Modules.PMS.FindMedia.Settings.ignoreDirs')" class="mt-3">
            <b-form-textarea
                id="ignoreDirs" name="ignoreDirs" type="text" class="form-control" v-model="ignoreDirs" @change="setIgnoreDirs"
                rows="3"
                max-rows="3"
                >
            </b-form-textarea>
        </b-input-group>
        <br>
        <div>
            <b-form-checkbox
                id="IgnoreHidden"
                v-model="IgnoreHidden"
                name="IgnoreHidden"
                value=true
                unchecked-value=false
                @change="setIgnoreHidden"
                >
                {{ $t('Modules.PMS.FindMedia.Settings.IgnoreHidden') }}
            </b-form-checkbox>
        </div>
        <!-- Disabled for now, since req a call for each media in lib
        <div>
            <b-form-checkbox
                id="IgnoreExtras"
                v-model="IgnoreExtras"
                name="IgnoreExtras"
                value=true
                unchecked-value=false
                @change="setIgnoreExtras"
                >
                {{ $t('Modules.PMS.FindMedia.Settings.IgnoreExtras') }}
            </b-form-checkbox>
        </div>
        -->

        <br>
        <br>
        <!-- Buttons -->
        <div class="buttons">
            <!-- Buttons -->
            <div id="buttons" class="text-center">
                <b-button-group >
                    <b-button variant="danger" class="mr-1" @click="reset"> {{ $t('Modules.PMS.FindMedia.Settings.Reset') }} </b-button>
                    <b-button variant="success" class="mr-1" @click="jumpToFM"> {{ $t('Modules.PMS.FindMedia.Settings.Return') }} </b-button>
                </b-button-group>
            </div>
        </div>
    </b-container>
</template>

<script>
    import { wtconfig } from '../../../General/wtutils';
    import { findMedia } from '../scripts/FindMedia';

    const log = require("electron-log");

    export default {
        data() {
            return {
                Ext: "",
                IgnoreHidden: true,
                IgnoreExtras: true,
                ignoreDirs: ""
            }
        },
        created() {
            log.info(`[FindMediaSettings.vue] (Created) - FMSettings created`);
            this.getSettings();
        },
        methods: {
            setIgnoreHidden( value ){
                wtconfig.set('PMS.FindMedia.Settings.IgnoreHidden', value === 'true');
            },
            setIgnoreExtras( value ){
                wtconfig.set('PMS.FindMedia.Settings.IgnoreExtras', value);
            },
            getSettings(){
                this.Ext = wtconfig.get('PMS.FindMedia.Settings.Ext').toString();
                this.IgnoreHidden = wtconfig.get('PMS.FindMedia.Settings.IgnoreHidden', true);
                this.IgnoreExtras = wtconfig.get('PMS.FindMedia.Settings.IgnoreExtras', true);
                this.ignoreDirs = wtconfig.get('PMS.FindMedia.Settings.ignoreDirs', findMedia.ignoreDirs).toString();
            },
            setExt( value ){
                // Remove spaces, and force to lower case
                let ext = value.trimStart().trimEnd().toLowerCase();
                // Update form
                this.Ext = ext;
                // Update conf file
                wtconfig.set('PMS.FindMedia.Settings.Ext', ext.split(','));
            },
            setIgnoreDirs( value ){
                let ignoreDirsArr = value.split(',');
                let newIgnoreDirsArr = [];
                ignoreDirsArr.forEach(element => {
                    newIgnoreDirsArr.push(element.trimStart().trimEnd().toLowerCase());
                });
                // Update form
                this.ignoreDirs = newIgnoreDirsArr.toString();
                // Update conf file
                wtconfig.set('PMS.FindMedia.Settings.ignoreDirs', newIgnoreDirsArr);
            },
            // Return to FindMedia
            jumpToFM(){
                this.$router.push({ name: 'FindMedia' })
            },
            // Reset to factory Std
            reset(){
                this.Ext = findMedia.defValidExt.toString();
                wtconfig.set('PMS.FindMedia.Settings.Ext', findMedia.defValidExt);
                this.ignoreDirs = findMedia.ignoreDirs.toString();
                wtconfig.set('PMS.FindMedia.Settings.ignoreDirs', findMedia.ignoreDirs);
                this.IgnoreHidden = true;
                wtconfig.set('PMS.FindMedia.Settings.IgnoreHidden', true);
                wtconfig.set('PMS.FindMedia.Settings.IgnoreExtras', true);
                this.IgnoreExtras = true;
                log.info(`[FindMediaSettings.vue] (reset) - FMSettings factory reset done`);
            }
        }
    };


</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
#sync-button {
  margin-left: 1em;
}
</style>
