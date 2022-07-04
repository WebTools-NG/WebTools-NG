<template>
  <b-container class="m-2 mt-2">
    <div>   <!-- Title and desc -->
      <h2>
        {{ $t(`Modules.${this.PageName}.Name`) }}
      </h2>
      <h5>{{ $t(`Modules.${this.PageName}.Description`) }}</h5>
    </div>
  </b-container>
</template>

<script>
  //import i18n from '../../../i18n';
  //import store from '../../../store';
  //import { wtconfig, wtutils } from '../General/wtutils';

  const log = require("electron-log");
  export default {
      data() {
        return {
          PageName: "Download"
        };
  },
  created() {
    log.info(`[${this.PageName}.vue] (created) - ${this.PageName} Created`);
  },
  methods: {
  },
  watch: {
  },
  computed: {
  }
};
</script>
