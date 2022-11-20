<template>
  <b-container class="m-2 mt-2">
    <loading
          :active="isLoading"
        />
    <div class="float-right">   <!-- Settings button hidden with d-none -->
      <div class="buttons">
        <!-- Buttons -->
        <b-button-group id="settings">
          <b-tooltip target="settings" triggers="hover">
              {{ $t(`Modules.${this.PageName}.ttSettings`) }}
          </b-tooltip>
          <button class="btn btn-outline-success" @click="showSettings"><i class="fa fa-cog"></i></button>
        </b-button-group>
      </div>
    </div>
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
    <b-progress :value="pgbaridx" :max="pgbarMaxSize" :variant="pgbarstyle" :key="pgbarstyle"></b-progress>
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
  import store from '../../../store';
  import { wtutils, wtconfig, dialog } from '../General/wtutils';
  import { time } from '../General/time';
  import { ptv } from '../General/plextv';
  import { etHelper } from '../ExportTools/scripts/ethelper';
  import VueVirtualTable from 'vue-virtual-table';
  import axios from 'axios';
  import Loading from 'vue-loading-overlay';
  import 'vue-loading-overlay/dist/vue-loading.css';

  const log = require("electron-log");
  export default {
    components: {
      VueVirtualTable,
      Loading
    },
    data() {
      return {
        isLoading: false,
        PageName: "Download",
        selSrvOptions: [],
        selSrv: null,
        selLibraryOptions: [],
        selMediaType: ['movie'],
        selLibraryWait: true,
        selLibrary: "",
        selLibrarySize: null,
        LibraryGroupDisabled: true,
        tableConfig: [
          { prop: 'mediaKey', isHidden: true },
          { prop: 'Key', isHidden: true },
          { prop: 'Title',searchable: true,sortable: true, width: 80 },
          { prop: 'Released',searchable: true,sortable: true, width: 30 },
          { prop: 'Added',searchable: true,sortable: true, width: 30 },
          { prop: 'Updated',searchable: true,sortable: true, width: 30 },
          { prop: 'Type', isHidden: true }

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
          { prop: 'Type',searchable: false,sortable: false, width: 10 },
          { prop: 'Hash',isHidden: true },
          { prop: 'Size', isHidden: true }
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
        pgbaridx: 0,
        pgbarstyle: "warning",
        pgbarMaxSize:0,
        mediaInfoTitle: "",
        selMediaDir: '',
        selMediaTitle: ''
      }
  },
  created() {
    log.info(`[${this.PageName}.vue] (created) - ${this.PageName} Created`);
    if ( !store.getters.getFeatures.includes("pass"))
    {
      dialog.ShowMsg( i18n.t("Modules.Download.Name"), i18n.t("Common.Ok"), i18n.t("Common.AppName"), i18n.t("Common.PPReq", [i18n.t("Modules.Download.Name")]), 'info' );
      this.$router.push({ name: 'home' });
    }
    this.getValidServers();
  },
  methods: {
    // Show Settings
    showSettings(){
      this.$router.push({ name: 'exportsettings' })
    },
    getTargetFile( serverName, libName, mediaDir, file){
      var path = require('path');
      return path.join(wtconfig.get('General.ExportPath'), wtutils.AppName, this.$t('Modules.Download.Name'), serverName, libName, mediaDir, file + '.tmp');
    },
    showQueue(){
      this.$router.push({ name: 'queue' });
    },
    createHash(str){
      return require('crypto').createHash('md5').update(str).digest("hex")
    },
    Select(index, row, state){
      const key = this.createHash(`${this.selSrv}-${row['Key']}`);  // Hashed with ServerID-Filename
      let arr = wtconfig.get(`Download.Queue`, []);
      if ( state === 'true' ){
        if ( arr.map(function(x) {return x.hash; }).indexOf(key) < 0 ){  //Missing entry ?
          let details = {};
          details['key'] = row['Key'];
          details['file'] = row['File'];
          details['serverID'] = this.selSrv;
          details['serverName'] = this.srvName;
          details['libName'] = this.selLibrary['libName'];
          details['mediaDir'] = this.selMediaDir;
          details['title'] = this.selMediaTitle;
          details['type'] = row['Type'];
          details['size'] = row['Size'];
          details['hash'] = key;
          details['baseAddress'] = this.srvBaseAddress;
          details['targetFile'] = this.getTargetFile( this.srvName, this.selLibrary['libName'], this.selMediaDir, row['File']);
          log.debug(`[Download.vue] (Select) - Adding ${key} with a value of: ${JSON.stringify(details)}`)
          arr.push(details)
          wtconfig.set(`Download.Queue`, arr);
        }
      }
      else {
        // Find idx of entry
        var idx = arr.map(function(x) {return x.hash; }).indexOf(key)
        log.debug(`[Download.vue] (Select) - Deleting ${idx}`)
        arr.splice(idx, 1);
        wtconfig.set(`Download.Queue`, arr);
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
          if ( this.MItableData.map(function(x) {return x.Key; }).indexOf(parts[idx]['key']) == -1){
            entry['Key'] = parts[idx]['key'];
            entry['Type'] = response['data']['MediaContainer']['Metadata'][0]['type'];
            entry['Size'] = parts[idx]['size'];
            for (var x in this.selLibrary['location']){
              if ( parts[idx]['file'].startsWith( this.selLibrary['location'][x]['path'] ) )
              {
                // Get Media Dir
                this.selMediaDir = path.dirname(parts[idx]['file'].slice( this.selLibrary['location'][x]['path'].length + 1));  // Returns a dot if not found
                entry['File'] = parts[idx]['file'].slice( this.selLibrary['location'][x]['path'].length + 1).slice(this.selMediaDir.length + 1);
                break;
              }
            }
            this.MItableData.push(entry);     //Add media
          }
          // Get media file without ext
          const mFile = path.parse(parts[idx]['file']).name
          for ( x in parts[idx]['Stream']){
            if (parts[idx]['Stream'][x]['key'] ){
              const streamKey = parts[idx]['Stream'][x]['key'];
              if ( this.MItableData.map(function(x) {return x.Key; }).indexOf(streamKey) == -1){
                entry = {};
                entry['Key'] = parts[idx]['Stream'][x]['key'];
                entry['Type'] = parts[idx]['Stream'][x]['format'];
                entry['File'] = `${mFile}.${parts[idx]['Stream'][x]['languageTag']}.${parts[idx]['Stream'][x]['format']}`;
                this.MItableData.push(entry);     //Add sub
              }
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
      // Start Spinner
      this.isLoading = true;
      await this.getMediaInfo(myarg['Key']);
      this.selMediaTitle = myarg['Title'];
      this.mediaInfoTitle = `${i18n.t("Modules.Download.mediaInfo.mediaInfoTitle")} - ${myarg['Title']}`
      // Stop Spinner
      this.isLoading = false;
      this.$refs['MediaInfo'].show();
    },
    async selSrvChanged() {
      if ( this.selSrv ){
        this.LibraryGroupDisabled = false;
        // Start spinner
        //this.selLibraryWait = false;
        this.isLoading = true;
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
        const sections = await etHelper.getSections( allPMSServer[idx]['PMSInfo']['address'], allPMSServer[idx]['accessToken'] );
        // Get Server Name
        this.srvName = allPMSServer[idx]['name'];
        // Get Server Token
        this.srvToken = allPMSServer[idx]['accessToken'];
        // Get Base Address
        this.srvBaseAddress = allPMSServer[idx]['PMSInfo']['address'];
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
        //this.selLibraryWait = true;
        this.isLoading = false;
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
      this.pgbaridx = 0;   // index
      // We need to scrape the library, so start by getting the size
      await this.getSectionSize(); // Store in this.selLibrarySize
      this.pgbarMaxSize = this.selLibrarySize;
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
        let response = await this.getSectionChunk(step, this.pgbaridx, libType);
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
        this.pgbaridx += step;
      } while ( gotSize == step );
      this.pgbarstyle = 'success';
    },
    async updateSrvList(){
      log.info(`[download.vue] (updateSrvList) - Start getting valid servers`);
      this.pgbaridx = 1;
      this.pgbarstyle = "warning";
      // Get all servers
      let allPMSSrv = await ptv.getPMSServers( true );
      this.pgbarMaxSize = 1 + allPMSSrv.length;
      // Walk each of them, to get the options
      for (var idx in allPMSSrv){
        if ( !allPMSSrv[idx]['PMSInfo'] ){
          // We need at least address and sync
          await ptv.updatePMSInfo( allPMSSrv[idx], idx, ['address', 'allowSync']);
        }
        this.pgbaridx += 1;
      }
      store.commit("UPDATE_VALID_DWNSRV", true);
    },
    // Get a list of servers, that we can download from
    async getValidServers(){
      log.info(`[download.vue] (getValidServers) - Starting`);
      this.isLoading = true;
      if (!store.getters.getValidSrvDone)   // If we haven't got valid address and sync info, update srv list
      {
        await this.updateSrvList();
      }
      log.info(`[download.vue] (getValidServers) - Building CBOptions`);
      // Get all servers
      let allPMSSrv = await ptv.getPMSServers( true );

      // Walk each of them, to get the options
      for (var idx in allPMSSrv){
        let option = {};
        if ( allPMSSrv[idx]['PMSInfo'] ){
          if ( allPMSSrv[idx]['PMSInfo']['allowSync'] === false) {
            option['disabled'] = true;
            option['text'] = `${allPMSSrv[idx]['name']} (${this.$t('Modules.Download.Disabled')})`;
          } else {
            option['text'] = allPMSSrv[idx]['name'];
          }
          option['value'] = allPMSSrv[idx]['clientIdentifier'];
        } else {
          option['disabled'] = true;
          option['text'] = `${allPMSSrv[idx]['name']} (${this.$t('Modules.Download.Disabled')})`;
        }
        option['value'] = allPMSSrv[idx]['clientIdentifier'];
        this.selSrvOptions.push(option);
      }
      this.pgbarstyle = "success";
      this.isLoading = false;
    }
  },
  watch: {
  },
  computed: {
  }
};
</script>
