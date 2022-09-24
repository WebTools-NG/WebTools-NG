<template>
  <b-container class="m-2 mt-2">
    <div class="float-right">   <!-- Settings button hidden with d-none -->
      <div class="buttons">
        <!-- Buttons -->
        <b-button-group id="settings">
          <b-tooltip target="settings" triggers="hover">
              {{ $t(`Modules.PMS.FindMedia.ttSettings`) }}
          </b-tooltip>
          <button class="btn btn-outline-success" @click="showSettings"><i class="fa fa-cog"></i></button>
        </b-button-group>
      </div>
    </div>
    <div>   <!-- Title and desc -->
      <h2>
        {{ $t(`Modules.PMS.FindMedia.Name`) }}
      </h2>
      <h5>{{ $t(`Modules.PMS.FindMedia.Description`) }}</h5>
    </div>
    <br>
  <div>
    <div class="d-flex align-items-center">    <!-- Select Lib -->
      <b-form-group>
        <WTNGttlabel tt="Modules.PMS.FindMedia.TTSelectLibrary" label="Modules.ET.optExpType.lblSelectSelection" />
        <b-form-select
          v-model="selLib"
          id="selLib"
          :options="selLibOptions"
          style="width: auto"
          name="selLib">
        </b-form-select>
      </b-form-group>
    </div>
    <br>
    <div class="buttons">  <!-- Buttons -->
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
  </div>
  </b-container>
</template>

<script>
  import i18n from '../../../../i18n';
  import { dialog } from '../../General/wtutils';
  import WTNGttlabel from '../../General/wtng-ttlabel.vue'
  import { pms } from '../../General/pms';
  import { findMedia } from './scripts/FindMedia.js';
  import statusDiv from '../../General/status.vue';
  import { status } from '../../General/status';

  const log = require("electron-log");
  export default {
    components: {
      statusDiv,
      WTNGttlabel
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
    // Show Settings
    showSettings(){
      this.$router.push({ name: 'FindMediaSettings' })
    },
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
        await status.clearStatus();
        await status.updateStatusMsg( status.RevMsgType.Status, i18n.t('Common.Status.Msg.Processing'));
        // Wait a short moment, so status can update
        await new Promise(resolve => setTimeout(resolve, 50));
        await findMedia.findMedia( this.selLib["location"], this.selLib["key"], this.selLib["type"] );
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
