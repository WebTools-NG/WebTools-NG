<template>
  <b-container fluid>
    <div class="col-lg-9 col-md-12 col-xs-12">
      <h2>
        {{ $t("Modules.PMS.Name") }}
        <br />
        <h5>{{ $t("Modules.PMS.Description") }}</h5>
      </h2>
      <br />
      {{ $t("Modules.PMS.Select") }}
      <br />
      <br />
      <h3>{{ $t("Common.Home.Modules") }}</h3>
      <div v-if="showButler">
        <p><b>{{ $t("Modules.PMS.Butler.Name") }}</b>
        <br />
        * {{ $t("Modules.PMS.Butler.Description") }}</p>
      </div>
      <div v-if="showDVR">
        <p><b>{{ $t("Modules.PMS.DVR.Name") }}</b>
        <br />
        * {{ $t("Modules.PMS.DVR.Description") }}</p>
      </div>
      <div v-if="showFindMissing">
        <p><b>{{ $t("Modules.PMS.FindMissing.Name") }}</b>
        <br />
        * {{ $t("Modules.PMS.FindMissing.Description") }}</p>
      </div>
      <div v-if="showSettings">
        <p><b>{{ $t("Modules.PMS.Settings.Name") }}</b>
        <br />
        * {{ $t("Modules.PMS.Settings.Description") }}</p>
      </div>
      <div v-if="showViewState">
        <p><b>{{ $t("Modules.PMS.ViewState.Name") }}</b>
        <br />
        * {{ $t("Modules.PMS.ViewState.Description") }}</p>
      </div>
    </div>
  </b-container>
</template>

<script>
  import i18n from '../../../i18n';
  import store from '../../../store';
  import { wtconfig, wtutils } from '../General/wtutils';

  i18n, store, wtconfig

  const log = require("electron-log");
  export default {
      data() {
        return {
          selLibraryWait: true,
          btnDisable: true,
          selMediaType: "movie",
          selLibrary: "",
          selLibraryOptions: [],
          selLevel: "",
          showButler: !(wtutils.hideMenu('pmsButler')),
          showDVR: !(wtutils.hideMenu('pmsDVR')),
          showFindMissing: !(wtutils.hideMenu('pmsFindMissing')),
          showSettings: !(wtutils.hideMenu('pmsSettings')),
          showViewState: !(wtutils.hideMenu('pmsViewState'))
        };
  },
  created() {
    log.info("PMS Created");
    this.serverSelected();
  },
  methods: {
    async serverSelected() {
      let serverCheck = this.$store.getters.getSelectedServer;
      if (serverCheck == "none") {
        log.debug("serverCheck is none");
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
