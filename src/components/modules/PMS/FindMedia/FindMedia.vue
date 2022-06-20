<template>
  <b-container fluid>
    <div class="col-lg-10 col-md-12 col-xs-12">
        <h1>{{ $t("Modules.PMS.FindMedia.Name") }}</h1>
        <p>{{ $t("Modules.PMS.FindMedia.Description") }}</p>
    </div>
    <!-- Select Lib -->
    <div class="d-flex align-items-center">
      <b-form-group id="SelLibGroup" v-bind:label="$t('Modules.ET.optExpType.lblSelectSelection')" label-size="lg" label-class="font-weight-bold pt-0">
        <b-tooltip target="SelLibGroup" triggers="hover">
          {{ $t('Modules.PMS.LibMapping.TTSelectLibrary') }}
        </b-tooltip>
        <b-form-select
          v-model="selLib"
          id="selLib"
          :options="selLibOptions"
          name="selLib">
        </b-form-select>
      </b-form-group>
    </div>
    <br>
    <!-- Buttons -->
    <div class="buttons">
      <!-- Buttons -->
      <div id="buttons" class="text-center">
          <b-button-group >
              <b-button variant="success" class="mr-1" :disabled="this.selLib == ''" @click="runFM"> {{ $t('Modules.PMS.FindMedia.RunTask') }} </b-button>
          </b-button-group>
      </div>
    </div>
    <br>
    <br>
    <br>
    <br>
    <br>
    <br>
    <br>
    <br>
    <statusDiv /> <!-- Status Div -->
  </b-container>
</template>

<script>
  import i18n from '../../../../i18n';
  //import store from '../../../store';
  import { dialog } from '../../General/wtutils';
  import { pms } from '../../General/pms';
  import { findMedia } from './scripts/FindMedia.js';
  import statusDiv from '../../General/status.vue';


  i18n

  const log = require("electron-log");
  export default {
    components: {
      statusDiv
    },
    data() {
      return {
        serverIsSelected: false,
        selLibOptions: [],
        selLib: "",
        selLibraryWait: true
      };
  },
  created() {
    log.info("FindMedia Created");
    this.serverSelected();
    this.getPMSSections();
    console.log('Ged 55-0: ' + this.selLib)
  },
  watch: {
      // Watch for when selected server address is updated
      selectedServerAddress: async function(){
        // Changed, so we need to update the libraries
        this.selLibraryWait = true;
        await this.getPMSSections();
        this.selLibraryWait = true;
      }
  },
  computed: {
    // We need this computed, for watching for changes to selected server
    selectedServerAddress: function(){
      return this.$store.getters.getSelectedServerAddress
    }
  },
  methods: {
    // Run FindMedia
    async runFM() {
      log.info(`[FindMedia.vue] (runFM) starting`);
      // Check if we have all lib paths mapped
      const mappedPathOK = await findMedia.checkPathMapping( this.selLib["location"] );
      if ( mappedPathOK === 'WTNG_ERROR_WTNG')
      {
        log.error(`[FindMedia.vue] (runFM) - Missing mapped path for: ${mappedPathOK}`);
        dialog.ShowMsgBox(i18n.t("Modules.PMS.FindMedia.MissingMapDesc"), 'error', i18n.t("Modules.PMS.FindMedia.MissingMapTitle"), [i18n.t("Common.Ok")]);
      }
      else{
        log.info(`[FindMedia.vue] (runFM) mappedPath is okay`);
        //await findMedia.scanFileSystemPaths( this.selLib );
        console.log('Ged 333-3 selLibOptions: ' + JSON.stringify(this.selLibOptions))
        await findMedia.findMedia( this.selLib["location"], this.selLib["key"], this.selLib["type"] );
        console.log('Ged 333-7 ended')
      }

    },
    // Get Library list
    getPMSSections: async function(){
        this.selLibrary = "";
        this.selLibOptions = await pms.getPMSSections(['movie', 'show']);
      },
    /* Check if a server is selected, and if not
    tell user, and disable backup */
    async serverSelected() {
      let serverCheck = this.$store.getters.getSelectedServer;
      this.serverIsSelected = ( this.$store.getters.getSelectedServer != "none" );
      if (serverCheck == "none") {
        log.debug("serverCheck is none");
        this.selDVR = "";
        this.$bvToast.toast(this.$t("Modules.PMS.ErrorNoServerSelectedMsg"), {
          title: this.$t("Modules.PMS.ErrorNoServerSelectedTitle"),
          autoHideDelay: 4000,
          solid: true,
          variant: 'primary',
          toaster: 'b-toaster-bottom-right'
        });
      }
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
