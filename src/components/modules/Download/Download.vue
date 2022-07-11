<template>
  <b-container class="m-2 mt-2">
    <div>   <!-- Title and desc -->
      <h2>
        {{ $t(`Modules.${this.PageName}.Name`) }}
      </h2>
      <h5>{{ $t(`Modules.${this.PageName}.Description`) }}</h5>
    </div>
    <div class="d-flex align-items-center">   <!-- Select Server -->
      <b-form-group id="PMSServers" v-bind:label="$t('Modules.Download.SelSrv')" label-size="lg" label-class="font-weight-bold pt-0">
        <div ref="libSpinner" id="libSpinner" :hidden="selSrvWait">
          <b-spinner id="libLoad" class="ml-auto text-danger"></b-spinner>
        </div>
        <b-tooltip target="PMSServers" triggers="hover">
          {{ $t('Modules.Download.TT-Server') }}
        </b-tooltip>
        <b-form-select
          v-model="selSrv"
          id="selSrv"
          :options="selSrvOptions"
          name="selSrv">
        </b-form-select>
      </b-form-group>
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
          PageName: "Download",
          selSrvOptions: [],
          selSrvWait: true
        };
  },
  created() {
    log.info(`[${this.PageName}.vue] (created) - ${this.PageName} Created`);
    this.getValidServers();
  },
  methods: {
    // Get a list of servers, that we can download from
    getValidServers(){
      console.log('Ged 44-3 get valid servers')
    }
  },
  watch: {
  },
  computed: {
  }
};
</script>
