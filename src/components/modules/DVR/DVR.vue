<template>
    <div class="col-lg-10 col-md-12 col-xs-12">
      <h3>{{ $t("Modules.DVR.Name") }} <br>
      </h3>
      {{ $t("Modules.DVR.Description") }}

      <br>
      <br>
      
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
          selLibraryWait: true,
          btnDisable: true,
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
