<template>
    <div class="col-lg-10 col-md-12 col-xs-12">
      <h3>{{ $t("Modules.DVR.Name") }} <br>
      </h3>
      {{ $t("Modules.DVR.Description") }}

      <br>
      <br>
      <b-form-row> <!-- Select Export type -->
        <b-col> <!-- Main type -->
          <div class="d-flex align-items-center">
          
            <b-form-group id="dvrSelDVRGroup" v-bind:label="$t('Modules.DVR.selDVR')" label-size="lg" label-class="font-weight-bold pt-0" name="dvrSelDVRGroup">
              <b-tooltip target="dvrSelDVRGroup" triggers="hover">
                {{ $t('Modules.DVR.ttselDVR') }}
              </b-tooltip>
              <b-form-select
                v-model="selDVR"
                id="selDVR"
                :options="optSelDVR"                
                name="selDVR">
              </b-form-select>
            </b-form-group>
            
            <b-button
                type="is-primary"
                @click="dvrBackup"
                icon-left="fas fa-file-download"
                icon-pack="fas"
                :disabled="btnDisable == true"
                variant="success"
              >
              {{ $t("Modules.DVR.lblBtnBackup") }}
            </b-button>
          </div>
          
        </b-col>
              
      </b-form-row>

      
      
    </div>
</template>

<script>
  import i18n from '../../../i18n';
  //import store from '../../../store';
  //import { wtconfig } from '../General/wtutils';
  import { dvr } from "./scripts/dvr";

  i18n, dvr

  const log = require("electron-log");
  export default {
      data() {
        return {
          optSelDVR: [],
          selDVR: "",

          selLibraryWait: true,
          btnDisable: false,
          selMediaType: "movie",
          selLibrary: "",
          selLibraryOptions: [],
          selLevel: "",
        };
  },
  created() {
    log.info("DVR Created");
    this.serverSelected();
  },
  watch: {
    // Watch for when selected server address is updated
    selectedServerAddress: async function(){
      log.info("DVR Selected server changed");
    }
  },
  computed: {
    // We need this computed, for watching for changes to selected server
    selectedServerAddress: function(){
      return this.$store.getters.getSelectedServerAddress
    }
  },
  methods: {
    async dvrBackup() {      
      log.info("DVR Backup started");
    },

    /* Check if a server is selected, and if not
    tell user, and disable backup */
    async serverSelected() {
      let serverCheck = this.$store.getters.getSelectedServer;
      if (serverCheck == "none") {
        log.debug("serverCheck is none");
        this.btnDisable = true;
        this.$bvToast.toast(this.$t("Modules.PMS.ErrorNoServerSelectedMsg"), {
          title: this.$t("Modules.PMS.ErrorNoServerSelectedTitle"),
          autoHideDelay: 4000,
          solid: true,
          variant: 'primary',
          toaster: 'b-toaster-bottom-right'
        });
      }
      else
      {
        this.btnDisable = false;
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
