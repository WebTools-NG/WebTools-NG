<template>
  <b-container fluid>
    <div class="col-lg-10 col-md-12 col-xs-12">
        <h1>{{ $t("Modules.PMS.ViewState.Name") }}</h1>
        <p>{{ $t("Modules.PMS.ViewState.Description") }}</p>
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
          id="selTargetUsr"
          :options="optSelTargetUsr"
          name="selTargetUsr">
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
    <b-container fluid> <!-- Status -->
      <b-row>
        <b-col sm="2">
          <label for="status">{{ $t('Modules.PMS.ViewState.Status.Names.Status') }}:</label>
        </b-col>
        <b-col sm="10">
          <b-form-textarea
            id="status"
            v-bind:placeholder="$t('Modules.PMS.ViewState.Status.Names.Status')"
            v-model="statusMsg"
            :disabled=true
            rows="1"
            max-rows="8">
          </b-form-textarea>
        </b-col>
      </b-row>
    </b-container>


  </b-container>

</template>

<script>
  import i18n from '../../../../i18n';
  import store from '../../../../store';
  //import { wtconfig } from '../General/wtutils';
  import { viewstate } from "./scripts/viewstate";

  const log = require("electron-log");
  export default {
      data() {
        return {
          optselSrcUsr: [],
          optSelTargetUsr: [],
          selTargetUsr: "",
          selSrcUsr: "",
          serverIsSelected: false,
          WaitForUsers: false,
          statusMsg: 'Idle'
        };
  },
  async created() {
    log.info("[ViewState.vue] viewState Created");
    this.serverSelected();
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
      log.info("DVR Selected server changed");
      viewstate.clearStatus();
      viewstate.updateStatusMsg(1, i18n.t("Modules.PMS.ViewState.Status.Msg.CollectUserInfo"));
      this.serverIsSelected = ( this.$store.getters.getSelectedServer != "none" );
      this.WaitForUsers = false;
      await viewstate.getServerToken();
      await viewstate.getUsers();
      this.optselSrcUsr = viewstate.viewStateUsers;
      this.optSelTargetUsr = viewstate.viewStateUsers;
      this.selSrcUsr = '';
      this.selTargetUsr = '',
      this.WaitForUsers = true;
      viewstate.updateStatusMsg(1, "idle");
    },
    // Watch for status update
    viewStateStatus: function() {
      this.statusMsg = this.$store.getters.getViewStateStatus;
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
