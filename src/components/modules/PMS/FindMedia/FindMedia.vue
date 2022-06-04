<template>
  <b-container fluid>
    <div class="col-lg-10 col-md-12 col-xs-12">
        <h1>{{ $t("Modules.PMS.FindMissing.Name") }}</h1>
        <p>{{ $t("Modules.PMS.FindMissing.Description") }}</p>
    </div>
  </b-container>
</template>

<script>
  import i18n from '../../../../i18n';
  //import store from '../../../store';
  //import { wtconfig } from '../General/wtutils';
  //import { dvr } from "./scripts/dvr";

  i18n

  const log = require("electron-log");
  export default {
      data() {
        return {
          serverIsSelected: false
        };
  },
  created() {
    log.info("FindMissing Created");
    this.serverSelected();
  },
  computed: {
    // We need this computed, for watching for changes to selected server
    selectedServerAddress: function(){
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
