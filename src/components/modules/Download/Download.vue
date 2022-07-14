<template>
  <b-container class="m-2 mt-2">
    <div>   <!-- Title and desc -->
      <h2>
        {{ $t(`Modules.${this.PageName}.Name`) }}
      </h2>
      <h5>{{ $t(`Modules.${this.PageName}.Description`) }}</h5>
    </div>
    <b-container>
      <b-form-row>
        <b-col> <!-- Select Server -->
          <b-form-group id="PMSServers" v-bind:label="$t('Modules.Download.SelSrv')" label-size="lg" label-class="font-weight-bold pt-0">
            <div ref="srvSpinner" id="srvSpinner" :hidden="selSrvWait">
              <b-spinner id="srvLoad" class="ml-auto text-danger"></b-spinner>
            </div>
            <b-tooltip target="PMSServers" triggers="hover">
              {{ $t('Modules.Download.TT-Server') }}
            </b-tooltip>
            <b-form-select
              v-model="selSrv"
              id="selSrv"
              @change="selSrvChanged"
              :options="selSrvOptions"
              name="selSrv">
            </b-form-select>
          </b-form-group>
        </b-col>
        <b-col> <!-- Select Library -->
          <b-form-group id="LibraryGroup" v-bind:label="$t('Modules.ET.optExpType.lblSelectSelection')" label-size="lg" label-class="font-weight-bold pt-0" :disabled=this.LibraryGroupDisabled>
              <div ref="libSpinner" id="libSpinner" :hidden="selLibraryWait">
                <b-spinner id="libLoad" class="ml-auto text-danger"></b-spinner>
              </div>
              <b-tooltip target="LibraryGroup" triggers="hover">
                {{ $t('Modules.ET.optExpType.ttExpLibrary') }}
              </b-tooltip>
              <b-form-select
                v-model="selLibrary"
                id="selLibrary"
                :options="selLibraryOptions"
                @change="selLibraryChanged"
                name="selLibrary">
              </b-form-select>
            </b-form-group>
        </b-col>
      </b-form-row>
    </b-container>
    <vue-virtual-table
     :config="tableConfig"
     :data="tableData"
     :bordered="tableAttribute.bordered"
     :minWidth="tableAttribute.minWidth"
     :language="tableAttribute.language">
    </vue-virtual-table>
  </b-container>
</template>

<script>
  //import i18n from '../../../i18n';
  //import store from '../../../store';
  import { wtutils, wtconfig } from '../General/wtutils';
  import { time } from '../General/time';
  import { ptv } from '../General/plextv';
  import { etHelper } from '../ExportTools/scripts/ethelper';
  import VueVirtualTable from 'vue-virtual-table';
  import axios from 'axios';

  const log = require("electron-log");
  export default {
    components: {
      VueVirtualTable
    },
    data() {
      return {
        PageName: "Download",
        selSrvOptions: [],
        selSrvWait: true,
        selSrv: null,
        selLibraryOptions: [],
        selMediaType: ['movie'],
        selLibraryWait: true,
        selLibrary: "",
        selLibrarySize: null,
        LibraryGroupDisabled: true,
        tableConfig: [
          { prop: 'Key', isHidden: true },
          { prop: 'Title',searchable: true,sortable: true, width: 80 },
          { prop: 'Released',searchable: true,sortable: true, width: 30 },
          { prop: 'Added',searchable: true,sortable: true, width: 30 },
          { prop: 'Updated',searchable: true,sortable: true, width: 30 },
          { prop: 'Type', isHidden: true },
        ],
        tableData: [],
        tableAttribute: {
          height: 650,
          itemHeight: 42,
          minWidth: 10,
          selectable: true,
          enableExport: true,
          bordered: true,
          hoverHighlight: true,
          language: "en"
        },
        srvBaseAddress: "",
        srvToken: "",
        srvName: "",
        uriExclude: "includeGuids=0&checkFiles=0&includeRelated=0&includeExtras=0&includeBandwidths=0&includeChapters=0&excludeElements=Actor,Collection,Country,Director,Genre,Label,Mood,Producer,Similar,Writer,Role&excludeFields=summary,tagline"
      }
  },
  created() {
    log.info(`[${this.PageName}.vue] (created) - ${this.PageName} Created`);
    this.getValidServers();
  },
  methods: {
    async selSrvChanged() {
      if ( this.selSrv ){
        this.LibraryGroupDisabled = false;
        // Start spinner
        this.selLibraryWait = false;
        log.verbose(`[Download.vue] (selSrvChanged) - Selected server is: ${this.selSrv}`)
        // Clear library options
        this.selLibraryOptions = [];
        // Get all servers
        const allPMSServer = await ptv.getPMSServers( true );
        // Find idx of selected server
        let idx = allPMSServer.map(function(x) {return x.clientIdentifier; }).indexOf(this.selSrv);
        // Get Sections
        const sections = await etHelper.getSections( allPMSServer[idx]['PMSInfo']['Address'], allPMSServer[idx]['accessToken'] );
        // Get Server Name
        this.srvName = allPMSServer[idx]['name'];
        // Get Server Token
        this.srvToken = allPMSServer[idx]['accessToken'];
        // Get Base Address
        this.srvBaseAddress = allPMSServer[idx]['PMSInfo']['Address'];
        // Filter sections to only include what's in this.selMediaType
        for (idx in sections){
          if ( this.selMediaType.includes(sections[idx]['type'])){
            let entry = {};
            let val = {};
            val['key'] = sections[idx]['key'];
            val['type'] = sections[idx]['type'];
            entry['text'] = sections[idx]['title'];
            //entry['value'] = sections[idx]['key'];
            entry['value'] = val;
            this.selLibraryOptions.push(entry);
          }
        }
        // Stop spinner
        this.selLibraryWait = true;
        log.debug(`[Download.vue] (selSrvChanged) - Libs avail are: ${JSON.stringify(this.selLibraryOptions)}`)
      }
    },
    async getSectionSize(){
      const url = `${this.srvBaseAddress}/library/sections/${this.selLibrary['key']}/all?X-Plex-Container-Size=0&X-Plex-Container-Start=0`;
      let header = wtutils.PMSHeader;
      header['X-Plex-Token'] = this.srvToken;
      log.debug(`[Download.vue] (getSectionSize) - Get size with url ${url}`);
      await axios({
        method: 'get',
        url: url,
        headers: header
      })
      .then((response) => {
        log.debug(`[Download.vue] (getSectionSize) - Response recieved`);
        this.selLibrarySize = response['data']['MediaContainer']['totalSize'];
      })
      .catch(function (error) {
        if (error.response) {
            log.error(`[Download.vue] (getSectionSize) - ${error.response.data}`);
            alert(error.response.data.errors[0].code + " " + error.response.data.errors[0].message)
        } else if (error.request) {
            log.error(`[Download.vue] (getSectionSize) - ${error.request}`);
        } else {
            log.error(`[Download.vue] (getSectionSize) - ${error.message}`);
        }
      });
    },
    async getSectionChunk( step, idx, type){
      const url = `${this.srvBaseAddress}/library/sections/${this.selLibrary['key']}/all?X-Plex-Container-Size=${step}&X-Plex-Container-Start=${idx}&type=${type}&${this.uriExclude}`;
      let header = wtutils.PMSHeader;
      header['X-Plex-Token'] = this.srvToken;
      log.debug(`[Download.vue] (getSectionChunk) - Get chunk with url ${url}`);
      return axios({
        method: 'get',
        url: url,
        headers: header
      })
      .then((response) => {
        log.debug(`[Download.vue] (getSectionChunk) - Response recieved`);
        return response['data']['MediaContainer']['Metadata'];
      })
      .catch(function (error) {
        if (error.response) {
            log.error(`[Download.vue] (getSectionChunk) - ${error.response.data}`);
            alert(error.response.data.errors[0].code + " " + error.response.data.errors[0].message)
        } else if (error.request) {
            log.error(`[Download.vue] (getSectionChunk) - ${error.request}`);
        } else {
            log.error(`[Download.vue] (getSectionChunk) - ${error.message}`);
        }
      });
    },
    async selLibraryChanged (){
      console.log('Ged 55-1 selLibraryChanged')
      // We need to scrape the library, so start by getting the size
      await this.getSectionSize(); // Store in this.selLibrarySize
      // Get library type
      let libType;
      switch ( this.selLibrary['type'] ){
        case 'movie':
          libType = 1;
          break;
        case 'show':
          libType = 4;
          break;
      }
      // Get allowed steps
      const step = wtconfig.get(`PMS.ContainerSize.${libType}`);
      let idx = 0;   // index

      console.log('Ged 55-3 libType', libType)
      console.log('Ged 55-3-2 step', step)

      do {
        // Grap a chunk of the library
        let response = await this.getSectionChunk(step, idx, libType);
        console.log('Ged 12-2', response.length)
        for (var x in response){
          let media = response[x];
          console.log('Ged 12-3 media', JSON.stringify(media))
          let entry = {};
          entry['Key'] = response[x]['ratingKey'];
          entry['Title'] = response[x]['title'];
          entry['Type'] = response[x]['type'];
          entry['Released'] = response[x]['originallyAvailableAt'];
          //entry['Released'] = await time.convertEpochToDate(response[x]['originallyAvailableAt']);

          //entry['Added'] = response[x]['addedAt'];
          entry['Added'] = await time.convertEpochToDate(response[x]['addedAt']);
          //entry['Updated'] = response[x]['updatedAt'];
          entry['Updated'] = await time.convertEpochToDate(response[x]['updatedAt']);
          this.tableData.push(entry);

        } 

        //console.log('Ged 55-4 response', JSON.stringify(response));
      } while ( step < 1 );


    },
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
