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
  import { ptv } from '../General/plextv'

  const log = require("electron-log");
  export default {
      data() {
        return {
          PageName: "Download",
          selSrvOptions: [],
          selSrvWait: true,
          selSrv: null
        };
  },
  created() {
    log.info(`[${this.PageName}.vue] (created) - ${this.PageName} Created`);
    this.getValidServers();
  },
  methods: {
    // Get a list of servers, that we can download from
    async getValidServers(){
      log.info(`[download.vue] (getValidServers) - Start getting valid servers`);
      this.selSrvWait = false;
      // Get all servers
      let allPMSSrv = await ptv.getPMSServers( true );
      // Walk each of them, to get the options
      for (var idx in allPMSSrv){
        if ( !allPMSSrv[idx]['PMSInfo'] ){
          await ptv.checkServerOptions(allPMSSrv[idx]);
        }
      }
      // Get all servers again, but this time with updated info
      allPMSSrv = await ptv.getPMSServers( true );
      for (idx in allPMSSrv){
        let option = {}
        option['text'] = allPMSSrv[idx]['name'];
        option['value'] = allPMSSrv[idx]['clientIdentifier'];
        option['disabled'] = (allPMSSrv[idx]['PMSInfo']['Sync'] === false);
        this.selSrvOptions.push(option);
      }
      this.selSrvWait = true;
    }
  },
  watch: {
  },
  computed: {
  }
};
</script>
