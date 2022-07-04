<template>
  <b-container class="m-2 mt-2">
    <div>   <!-- Title and desc -->
      <h2>
        {{ $t(`Modules.PMS.ViewState.Name`) }}
      </h2>
      <h5>{{ $t(`Modules.PMS.ViewState.Description`) }}</h5>
    </div>
    <div class="d-flex align-items-center">
      <b-form-group id="ViewStateSelSourceUsrGroup" v-bind:label="$t('Modules.PMS.ViewState.selSourceUsr')" label-size="lg" label-class="font-weight-bold pt-0" name="ViewStateSelSourceUsrGroup">
        <b-tooltip target="ViewStateSelSourceUsrGroup" triggers="hover">
          {{ $t('Modules.PMS.ViewState.ttSelSourceUsr') }}
        </b-tooltip>
        <b-form-select
          v-model="selSrcUsr"
          id="selSrcUsr"
          :options="optselSrcUsr"
          @change="selSrcUsrChanged"
          name="selSrcUsr">
        </b-form-select>
      </b-form-group>
    </div>
    <div ref="libSpinner" id="libSpinner" :hidden="WaitForUsers">
      <b-spinner id="libLoad" class="ml-auto text-danger"></b-spinner>
    </div>
    <div class="d-flex align-items-center">
      <b-form-group id="ViewStateSelTargetUsrGroup" v-bind:label="$t('Modules.PMS.ViewState.selTargetUsr')" label-size="lg" label-class="font-weight-bold pt-0" name="ViewStateSelTargetUsrGroup">
        <b-tooltip target="ViewStateSelTargetUsrGroup" triggers="hover">
          {{ $t('Modules.PMS.ViewState.ttSelTargetUsr') }}
        </b-tooltip>
        <b-form-select
          v-model="selTargetUsr"
          @change="selTargetUsrChanged"
          id="selTargetUsr"
          :options="optSelTargetUsr"
          name="selTargetUsr">
        </b-form-select>
      </b-form-group>
    </div>
    <br>
    <br>
    <b-form-group id="b-form-group">
      <b-form-checkbox-group
        stacked
        :options="cbOptions"
        v-model="cbSelected"
        @change.native="cbChanged">
      </b-form-checkbox-group>
    </b-form-group>
    <div class="buttons">
        <!-- Buttons -->
        <div id="buttons" class="text-center">
            <b-button-group >
                <b-button
                  class="mr-2"
                  type="is-primary"
                  @click="copyViewState"
                  icon-left="fas fa-file-download"
                  icon-pack="fas"
                  :disabled="this.DisableCopy"
                  variant="success"
                  >
                  {{ $t("Modules.PMS.ViewState.lblBtnCopy") }}
                </b-button>
            </b-button-group>
        </div>
    </div>
    <br>
    <statusDiv /> <!-- Status Div -->
  </b-container>
</template>

<script>
  import i18n from '../../../../i18n';
  import store from '../../../../store';
  import { wtconfig } from '../../General/wtutils'
  import { status } from '../../General/status';
  import { viewstate } from "./scripts/viewstate";
  import statusDiv from '../../General/status.vue'
  const log = require("electron-log");
  export default {
    components: {
      statusDiv
    },
      data() {
        return {
          optselSrcUsr: [],
          optSelTargetUsr: [],
          selTargetUsr: "",
          selSrcUsr: "",
          serverIsSelected: false,
          WaitForUsers: false,
          cbSelected: [],
          cbOptions: [
              { text: i18n.t('Modules.PMS.ViewState.genRep'), value: 'ExpReport' }
          ]
        };
  },
  async created() {
    log.info("[ViewState.vue] viewState Created");
    this.serverSelected();
    this.getDefaults();
    if (store.getters.getSelectedServer != 'none'){
      this.WaitForUsers = false;
      await viewstate.getUsers();
      this.optselSrcUsr = viewstate.viewStateUsers;
      this.optSelTargetUsr = viewstate.viewStateUsers;
      this.WaitForUsers = true;
    }
  },
  watch: {
    // Watch for when selected server address is updated
    selectedServerAddress: async function(){
      log.info("ViewState selected server changed");
      status.clearStatus();
      status.updateStatusMsg( status.RevMsgType.Status, i18n.t("Common.Status.Msg.CollectUserInfo"));
      viewstate.SrcUsr = null;
      viewstate.TargetUsr = null;
      this.serverIsSelected = ( this.$store.getters.getSelectedServer != "none" );
      this.WaitForUsers = false;
      await viewstate.getServerToken();
      await viewstate.getUsers();
      this.optselSrcUsr = viewstate.viewStateUsers;
      this.optSelTargetUsr = viewstate.viewStateUsers;
      this.selSrcUsr = '';
      this.selTargetUsr = '',
      this.WaitForUsers = true;
      status.updateStatusMsg( status.RevMsgType.Status, i18n.t("Common.Status.Msg.Idle"));
    }
  },
  computed: {
      // We need this computed, for watching for changes to selected server
      selectedServerAddress: function(){
      return this.$store.getters.getSelectedServerAddress
    },
    DisableCopy : function(){
      // Only enable copy btn. if we have a server, users are selected and not identical
      return !(this.WaitForUsers&&(this.selTargetUsr)&&(this.selSrcUsr)&&(this.selTargetUsr!=this.selSrcUsr))
    },
    viewStateStatus: function(){
      return this.$store.getters.getViewStateStatus;
    }
  },
  methods: {
    // Get defaults
    getDefaults(){
      const cbItems = ["ExpReport"];
      for(let i = 0; i < cbItems.length; i++){
        if (wtconfig.get("PMS.ViewState." + cbItems[i], false)){
            this.cbSelected.push(cbItems[i]);
        }
      }
    },
    // Toggle generation of report
    async cbChanged(){
      for( var cbItem of ["ExpReport"]){
        wtconfig.set("PMS.ViewState." + cbItem, (this.cbSelected.includes(cbItem)))
      }
    },
    // SrcUsr changed
    async selSrcUsrChanged() {
      viewstate.SrcUsr = this.selSrcUsr;
      await viewstate.setOwnerStatus( 'selSrcUsr', this.selSrcUsr);
      await viewstate.getLibs( this.selSrcUsr, this.selTargetUsr );
    },
    // SrcUsr changed
    async selTargetUsrChanged() {
      viewstate.TargetUsr = this.selTargetUsr;
      await viewstate.setOwnerStatus( 'selTargetUsr', this.selTargetUsr );
      await viewstate.getLibs( this.selSrcUsr, this.selTargetUsr );
    },
    /* Check if a server is selected, and if not
    tell user, and disable copy */
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
    async copyViewState(){
      viewstate.copyViewState( this.selSrcUsr, this.selTargetUsr );
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
