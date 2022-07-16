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
    <b-progress :value="idx" :max="selLibrarySize" :variant="pgbarstyle" :key="pgbarstyle"></b-progress>
    <vue-virtual-table
     @click="rowClicked"
     :key="idx"
     :config="tableConfig"
     :data="tableData"
     :bordered="tableAttribute.bordered"
     :minWidth="tableAttribute.minWidth"
     :language="tableAttribute.language">
    </vue-virtual-table>
    <b-modal size="lg" ref="MediaInfo" hide-footer v-bind:title=this.mediaInfoTitle>
      <vue-virtual-table
        :key="idx"
        :config="MItableConfig"
        :data="MItableData"
        :bordered="MItableAttribute.bordered"
        :minWidth="MItableAttribute.minWidth"
        :language="MItableAttribute.language">
        <template slot-scope="scope" slot="actionCommon">
          <b-form-checkbox
            value=true
            unchecked-value=false
            v-on:change="Select(scope.index, scope.row, $event)"
          >
          </b-form-checkbox>
        </template>
      </vue-virtual-table>
    </b-modal>
    <br>
    <div class="d-flex mx-auto">
      <div class="buttons d-flex mx-auto"> <!-- Buttons -->
        <b-button
          type="is-primary"
          @click="showQueue"
          variant="success"
        >
        {{ $t("Modules.Download.ShowQueue") }}</b-button>
      </div>
    </div>
  </b-container>
</template>

<script>
  import i18n from '../../../i18n';
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
          height: 1000,
          itemHeight: 42,
          minWidth: 10,
          selectable: true,
          enableExport: false,
          bordered: true,
          hoverHighlight: true,
          language: "en"
        },
        MItableConfig: [
          { prop: '_action', name: ' ', actionName: 'actionCommon', width: 10 },
          { prop: 'Key', isHidden: true },
          { prop: 'File',searchable: false,sortable: false, width: 100 },
          { prop: 'Type',searchable: false,sortable: false, width: 10 }
        ],
        MItableData: [],
        MItableAttribute: {
          height: 1000,
          itemHeight: 42,
          minWidth: 10,
          selectable: false,
          enableExport: false,
          bordered: true,
          hoverHighlight: true,
          language: "en"
        },
        srvBaseAddress: "",
        srvToken: "",
        srvName: "",
        uriExclude: "includeGuids=0&checkFiles=0&includeRelated=0&includeExtras=0&includeBandwidths=0&includeChapters=0&excludeElements=Actor,Collection,Country,Director,Genre,Label,Mood,Producer,Similar,Writer,Role,Rating&excludeFields=summary,tagline",
        idx: 0,
        pgbarstyle: "warning",
        mediaInfoTitle: "",
        selMediaDir: '',
        selMediaTitle: ''
      }
  },
  created() {
    log.info(`[${this.PageName}.vue] (created) - ${this.PageName} Created`);
    this.getValidServers();
  },
  methods: {
    showQueue(){
      console.log('Ged 87-3 Show Queue')
    },
    createHash(str){
      return require('crypto').createHash('md5').update(str).digest("hex")
    },
    Select(index, row, state){
      if ( state === 'true' ){
        let details = {};
        details['key'] = row['Key'];
        details['file'] = row['File'];
        details['serverID'] = this.selSrv;
        details['serverName'] = this.srvName;
        details['libName'] = this.selLibrary['libName'];
        details['mediaDir'] = this.selMediaDir;
        details['title'] = this.selMediaTitle;
        details['type'] = row['Type'];
        const key = this.createHash(`${this.srvName}-${row['Key']}`);
        log.debug(`[Download.vue] (Select) - Adding ${key} with a value of: ${JSON.stringify(details)}`)
        wtconfig.set(`Download.${key}`, details);
      }
      else {
        const key = this.createHash(`${this.srvName}-${row['Key']}`);
        log.debug(`[Download.vue] (Select) - Deleting ${key}`)
        wtconfig.delete(`Download.${key}`);
      }
    },
    async getMediaInfo(key){
      const url = `${this.srvBaseAddress}/library/metadata/${key}?${this.uriExclude}`;
      let header = wtutils.PMSHeader;
      header['X-Plex-Token'] = this.srvToken;
      log.debug(`[Download.vue] (getMediaInfo) - Get mediainfo for with url ${url}`);
      await axios({
        method: 'get',
        url: url,
        headers: header
      })
      .then((response) => {
        log.debug(`[Download.vue] (getMediaInfo) - Response recieved`);
        const parts = response['data']['MediaContainer']['Metadata'][0]['Media'][0]['Part'];
        var path = require('path');
        for (var idx in parts){
          let entry = {};
          for (var x in this.selLibrary['location']){
            if ( parts[idx]['file'].startsWith( this.selLibrary['location'][x]['path'] ) )
            {
              // Get Media Dir
              this.selMediaDir = path.dirname(parts[idx]['file'].slice( this.selLibrary['location'][x]['path'].length + 1));  // Returns a dot if not found
              entry['File'] = parts[idx]['file'].slice( this.selLibrary['location'][x]['path'].length + 1).slice(this.selMediaDir.length + 1);
              break;
            }
          }
          entry['Key'] = parts[idx]['key'];
          entry['Type'] = response['data']['MediaContainer']['Metadata'][0]['type'];
          this.MItableData.push(entry);     //Add media
          // Get media file without ext
          const mFile = path.parse(entry['File']).name
          for ( x in parts[idx]['Stream']){
            if (parts[idx]['Stream'][x]['key'] ){
              entry = {};
              entry['Key'] = parts[idx]['Stream'][x]['key'];
              entry['Type'] = parts[idx]['Stream'][x]['format'];
              entry['File'] = `${mFile}.${parts[idx]['Stream'][x]['languageTag']}.${parts[idx]['Stream'][x]['format']}`;
              this.MItableData.push(entry);     //Add sub
            }
          }
        }
      })
      .catch(function (error) {
        if (error.response) {
            log.error(`[Download.vue] (getMediaInfo) - ${error.response.data}`);
            alert(error.response.data.errors[0].code + " " + error.response.data.errors[0].message)
        } else if (error.request) {
            log.error(`[Download.vue] (getMediaInfo) - ${error.request}`);
        } else {
            log.error(`[Download.vue] (getMediaInfo) - ${error.message}`);
        }
      });
    },
    async rowClicked(myarg){
      this.MItableData = [];
      await this.getMediaInfo(myarg['Key']);
      this.selMediaTitle = myarg['Title'];
      this.mediaInfoTitle = `${i18n.t("Modules.Download.MediaInfoTitle")} - ${myarg['Title']}`
      this.$refs['MediaInfo'].show();
    },
    async selSrvChanged() {
      if ( this.selSrv ){
        this.LibraryGroupDisabled = false;
        // Start spinner
        this.selLibraryWait = false;
        log.verbose(`[Download.vue] (selSrvChanged) - Selected server is: ${this.selSrv}`)
        // Clear library options
        this.selLibraryOptions = [];
        // Clear list
        this.tableData = [];
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
        // Filter sections to only include whats in this.selMediaType
        for (idx in sections){
          if ( this.selMediaType.includes(sections[idx]['type'])){
            let entry = {};
            let val = {};
            val['key'] = sections[idx]['key'];
            val['type'] = sections[idx]['type'];
            val['libName'] = sections[idx]['title'];
            entry['text'] = sections[idx]['title'];
            val['location'] = sections[idx]['location'];
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
      // Clean out list
      this.tableData = [];
      this.idx = 0;   // index
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
      let gotSize;
      this.pgbarstyle = 'warning';
      do {
        // Grap a chunk of the library
        let response = await this.getSectionChunk(step, this.idx, libType);
        gotSize = response.length;
        for (var x in response){
          let entry = {};
          entry['Key'] = response[x]['ratingKey'];
          entry['Title'] = response[x]['title'];
          entry['Type'] = response[x]['type'];
          entry['Released'] = response[x]['originallyAvailableAt'];
          entry['Added'] = await time.convertEpochToDate(response[x]['addedAt']);
          entry['Updated'] = await time.convertEpochToDate(response[x]['updatedAt']);
          this.tableData.push(entry);
        }
        this.idx += step;
      } while ( gotSize == step );
      this.pgbarstyle = 'success';
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
