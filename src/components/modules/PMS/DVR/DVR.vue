<template>
  <b-container fluid>
    <div class="col-lg-10 col-md-12 col-xs-12">
        <h1>{{ $t("Modules.PMS.DVR.Name") }}</h1>
        <p>{{ $t("Modules.PMS.DVR.Description") }}</p>
    </div> 

    <div class="d-flex align-items-center">
      <b-form-group id="dvrSelDVRGroup" v-bind:label="$t('Modules.PMS.DVR.selDVR')" label-size="lg" label-class="font-weight-bold pt-0" name="dvrSelDVRGroup">
        <b-tooltip target="dvrSelDVRGroup" triggers="hover">
          {{ $t('Modules.PMS.DVR.ttselDVR') }}
        </b-tooltip>
        <b-form-select
          v-model="selDVR"
          id="selDVR"
          :options="optSelDVR"        
          name="selDVR">
        </b-form-select>
      </b-form-group>
    </div>
    <br>  
    <br>
    <div class="buttons">
        <!-- Buttons -->
        <div id="buttons" class="text-center">
            <b-button-group >
                <b-button
                  class="mr-2"
                  type="is-primary"
                  @click="dvrBackup"
                  icon-left="fas fa-file-download"
                  icon-pack="fas"
                  :disabled="this.selDVR == ''"
                  variant="success"
                  > 
                  {{ $t("Modules.PMS.DVR.lblBtnBackup") }}
                </b-button>        
                <b-button
                  class="mr-2"
                  type="is-primary"
                  @click="dvrRestore"
                  icon-left="fas fa-file-download"
                  icon-pack="fas"
                  variant="success"
                  > 
                  {{ $t("Modules.PMS.DVR.lblBtnRestore") }}
                </b-button>        
            </b-button-group>
        </div>
    </div>     

    
  </b-container>
</template>

<script>
  import i18n from '../../../../i18n';
  //import store from '../../../store';
  //import { wtconfig } from '../General/wtutils';
  import { dvr } from "./scripts/dvr";

  i18n, dvr

  const log = require("electron-log");
  export default {
      data() {
        return {
          optSelDVR: [],
          selDVR: ""
        };
  },
  created() {
    log.info("DVR Created");
    this.serverSelected();
    this.optSelDVR = this.getDVRList();    
  },
  watch: {
    // Watch for when selected server address is updated
    selectedServerAddress: async function(){
      log.info("DVR Selected server changed");
      this.optSelDVR = this.getDVRList();
    },
    doneDVRBackup: async function(){
      if (this.$store.getters.doneDVRBackup!='')
      {
        this.$bvToast.toast(this.$t(this.$store.getters.doneDVRBackup), {
          title: this.$t("Modules.PMS.DVR.BackupDone"),
          autoHideDelay: 4000,
          solid: true,
          variant: 'primary',
          toaster: 'b-toaster-bottom-right'
        });
      }
    }
  },
  computed: {
    // We need this computed, for watching for changes to selected server
    selectedServerAddress: function(){
      return this.$store.getters.getSelectedServerAddress
    },
    doneDVRBackup: function(){
      return this.$store.getters.doneDVRBackup
    }

  },
  methods: {
    async dvrRestore() {      
      log.info("DVR Restore started");
      //dvr.backupDVR( {'dvrName': this.selDVR} );  
      dvr.restoreDVR();    
    },
    async dvrBackup() {      
      log.info("DVR Backup started");
      dvr.backupDVR( {'dvrName': this.selDVR} );
    },
    async getDVRList() {
      this.optSelDVR = await dvr.getDVRList();
    },

    /* Check if a server is selected, and if not
    tell user, and disable backup */
    async serverSelected() {
      let serverCheck = this.$store.getters.getSelectedServer;
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
