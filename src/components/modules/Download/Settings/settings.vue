<template>
  <b-container class="m-2 mt-2">
    <div>   <!-- Title and desc -->
      <h2>
        {{ $t(`Modules.Download.Settings.Name`) }}
      </h2>
      <h5>{{ $t(`Modules.Download.Settings.Description`) }}</h5>
    </div>
    <br>
    <br>
    <b-form-group id="grpDownloadMaxBandWidth" v-bind:label="$t('Modules.Download.Settings.DownloadMaxBandWidth')" label-size="lg" label-class="font-weight-bold pt-0">
        <b-form-select
            class="form-control"
            v-model="DownloadMaxBandWidth"
            id="DownloadMaxBandWidth"
            :options="DownloadMaxBandWidthOptions"
            @change="DownloadMaxBandWidthChanged"
            style="width: 50%"
            name="DownloadMaxBandWidth">
        </b-form-select>
        <WTNGtt tt="Modules.Download.Settings.ttDownloadMaxBandWidth" size="20px"></WTNGtt>
    </b-form-group>
    <b-form-group id="grpDownloadMaxErrors" v-bind:label="$t('Modules.Download.Settings.DownloadMaxErrors')" label-size="lg" label-class="font-weight-bold pt-0">
        <b-form-select
            class="form-control"
            v-model="DownloadMaxErrors"
            id="DownloadMaxErrors"
            :options="DownloadMaxErrorsOptions"
            @change="DownloadMaxErrorsChanged"
            style="width: 50%"
            name="DownloadMaxErrors">
        </b-form-select>
        <WTNGtt tt="Modules.Download.Settings.ttDownloadMaxErrors" size="20px"></WTNGtt>
    </b-form-group>
    <br>
    <br>
    <!-- Buttons -->
    <div class="buttons">
        <!-- Buttons -->
        <div id="buttons" class="text-center">
            <b-button-group >
                <b-button variant="success" class="mr-1" @click="Return"> {{ $t('Modules.Download.Settings.Return') }} </b-button>
            </b-button-group>
        </div>
    </div>
  </b-container>
</template>

<script>
    const log = require("electron-log");
    import {wtutils, wtconfig, dialog} from '../../General/wtutils';
    import WTNGtt from '../../General/wtng-tt.vue'
    log, wtutils, wtconfig, dialog
    import i18n from '../../../../i18n'
    i18n
    export default {
        components: {
            WTNGtt
        },
        created() {
            this.getDefaults();
        },
        data() {
            return {
                DownloadMaxBandWidth: '',
                DownloadMaxBandWidthOptions: [
                    {text: 'Unlimited', value: 100000000000000},  // Unlimited
                    {text: '50Mb/s', value: 50},
                    {text: '40Mb/s', value: 40},
                    {text: '30Mb/s', value: 30},
                    {text: '20Mb/s', value: 20},
                    {text: '15Mb/s', value: 15},
                    {text: '10Mb/s', value: 10},
                    {text: '7Mb/s', value: 7},
                    {text: '5Mb/s', value: 5},
                    {text: '3Mb/s', value: 3},
                    {text: '1Mb/s', value: 1}
                ],
                DownloadMaxErrors: '',
                DownloadMaxErrorsOptions: [
                    {text: '15', value: 15},
                    {text: '10', value: 10},
                    {text: '7', value: 7},
                    {text: '5', value: 5},
                    {text: '3', value: 3},
                    {text: '1', value: 1}
                ]
            };
        },
        methods: {
            // Return to ET
            Return(){
                this.$router.push({ name: 'download' })
            },
            DownloadMaxBandWidthChanged(){
                wtconfig.set("Download.DownloadMaxBandWidth", this.DownloadMaxBandWidth);
            },
            DownloadMaxErrorsChanged(){
                wtconfig.set("Download.DownloadMaxErrors", this.DownloadMaxErrors);
            },
            getDefaults(){
                this.DownloadMaxBandWidth = wtconfig.get("Download.DownloadMaxBandWidth", 7);
                this.DownloadMaxErrors = wtconfig.get("Download.DownloadMaxErrors", 5);
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
    #qmark2222{
        margin-left:10px;
    }
    i.ttqmark{
        margin-left:10px;
    }

</style>
