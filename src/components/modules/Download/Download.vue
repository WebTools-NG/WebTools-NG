<template>
  <b-container fluid>
    <div>   <!-- Title and desc -->
      <h2>
        {{ $t("Modules.Download.Name") }}
      </h2>
      <h5>{{ $t("Modules.Download.Description") }}</h5>
    </div>
    <br>
    <br>


  </b-container>
</template>

<script>
  //import i18n from '../../../i18n';
  //import store from '../../../store';
  //import { wtconfig, wtutils } from '../General/wtutils';

  //i18n, store, wtconfig

  const log = require("electron-log");
  export default {
      data() {
        return {
        };
  },
  created() {
    log.info(`[Download.vue] (created) - Download Created`);
  },
  methods: {
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
#sync-button {
  margin-left: 1em;
}
</style>
