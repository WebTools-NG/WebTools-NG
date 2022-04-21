<template>
  <b-container fluid>
    <div class="col-lg-10 col-md-12 col-xs-12">
        <h1>{{ $t("Modules.PMS.WiewState.Name") }}</h1>
        <p>{{ $t("Modules.PMS.WiewState.Description") }}</p>
    </div>

    <div class="d-flex align-items-center">
      <b-form-group id="WiewStateSelSourceUsrGroup" v-bind:label="$t('Modules.PMS.WiewState.selSourceUsr')" label-size="lg" label-class="font-weight-bold pt-0" name="WiewStateSelSourceUsrGroup">
        <b-tooltip target="WiewStateSelSourceUsrGroup" triggers="hover">
          {{ $t('Modules.PMS.WiewState.ttSelSourceUsr') }}
        </b-tooltip>
        <b-form-select
          v-model="selSrcUsr"
          id="selSrcUsr"
          :options="optselSrcUsr"
          name="selSrcUsr">
        </b-form-select>
      </b-form-group>
    </div>
    
    
    <div class="d-flex align-items-center">
      <b-form-group id="WiewStateSelSourceUsrGroup" v-bind:label="$t('Modules.PMS.WiewState.selSourceUsr')" label-size="lg" label-class="font-weight-bold pt-0" name="WiewStateSelSourceUsrGroup">
        <b-tooltip target="WiewStateSelSourceUsrGroup" triggers="hover">
          {{ $t('Modules.PMS.WiewState.ttSelSourceUsr') }}
        </b-tooltip>
        <b-form-select
          v-model="selSrcUsr"
          id="selSrcUsr"
          :options="optselSrcUsr"
          name="selSrcUsr">
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
                  :disabled=!this.serverIsSelected
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
  import { wiewstate } from "./scripts/wiewstate";

  i18n, wiewstate

  const log = require("electron-log");
  export default {
      data() {
        return {
          optselSrcUsr: [],
          selSrcUsr: "",
          serverIsSelected: false
        };
  },
  created() {
    log.info("WiewState Created");
    this.serverSelected();
  },
  watch: {
    // Watch for when selected server address is updated
    selectedServerAddress: async function(){
      log.info("DVR Selected server changed");
      this.serverIsSelected = ( this.$store.getters.getSelectedServer != "none" );
    }    
  },
  computed: {
    // We need this computed, for watching for changes to selected server
    selectedServerAddress: function(){
      // We need to get the server token as well
      this.getServerToken();

      return this.$store.getters.getSelectedServerAddress
      
    }
  },
  methods: {    
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
    },
    async getServerToken() {
      console.log('Ged 44 get server token')
      await wiewstate.getServerToken();
      console.log('Ged 45 got server token')

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
