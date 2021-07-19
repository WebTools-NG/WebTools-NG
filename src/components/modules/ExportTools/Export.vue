<template>
  <b-container fluid>
    <div class="col-lg-10 col-md-12 col-xs-12">
      <h3>{{ $t("Modules.ET.Name") }} <br>
        <small>{{ $t("Modules.ET.Description") }}</small>
      </h3>
      <br />
      <b-form-row> <!-- Select Export type -->
        <b-col> <!-- Main type -->
          <div class="d-flex align-items-center">
            <b-form-group id="etLibTypeMainGroup" v-bind:label="$t('Modules.ET.optExpType.lblMainExp')" label-size="lg" label-class="font-weight-bold pt-0">
              <b-tooltip target="etLibTypeMainGroup" triggers="hover">
                {{ $t('Modules.ET.optExpType.ttExpType') }}
              </b-tooltip>
              <b-form-select
                v-model="selExpTypeMain"
                id="selExpTypeMain"
                :options="optExpTypeMain"
                @change="selExpTypeMainChanged"
                name="selExpTypeMain">
              </b-form-select>
            </b-form-group>
          </div>
        </b-col>
        <b-col> <!-- Sec type -->
          <div class="d-flex align-items-center">
            <b-form-group id="etLibTypeSecGroup" v-bind:label="$t('Modules.ET.optExpType.lblSecExp')" label-size="lg" label-class="font-weight-bold pt-0">
              <b-tooltip target="etLibTypeSecGroup" triggers="hover">
                {{ $t('Modules.ET.optExpType.ttExpTypeSec') }}
              </b-tooltip>
              <b-form-select
                v-model="selExpTypeSec"
                id="selExpTypeSec"
                :options="optExpTypeSec"
                @change="selExpTypeSecChanged"
                name="selExpTypeSec">
              </b-form-select>
            </b-form-group>
          </div>
        </b-col>
      </b-form-row>
      <b-form-row> <!-- Select Library -->
        <b-col>
          <div class="d-flex align-items-center">
            <b-form-group id="etLibraryGroup" v-bind:label="$t('Modules.ET.optExpType.lblSelectSelection')" label-size="lg" label-class="font-weight-bold pt-0" :disabled=this.etLibraryGroupDisabled>
              <div ref="libSpinner" id="libSpinner" :hidden="selLibraryWait">
                <b-spinner id="libLoad" class="ml-auto text-danger"></b-spinner>
              </div>
              <b-tooltip target="etLibraryGroup" triggers="hover">
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
          </div>
        </b-col>
      </b-form-row>
      <b-form-row> <!-- Select Export Level -->
        <b-col>
          <div> 
            <b-form-group id="etLevelGroup" v-bind:label="$t('Modules.ET.optExpType.lblExportLevel')" label-size="lg" label-class="font-weight-bold pt-0" :disabled=this.etLevelGroupDisabled>
              <b-tooltip target="etLevelGroup" triggers="hover">
                {{ $t('Modules.ET.optExpType.ttExpLevel') }}
              </b-tooltip>
              <b-form-select
                class="form-control"
                v-model="selLevel"
                id="selLevel"
                :options="exportLevels"
                name="selLevel">
              </b-form-select>
            </b-form-group>
          </div>
        </b-col>
      </b-form-row>
      <div class="buttons"> <!-- Buttons -->
        <b-button
          type="is-primary"
          @click="getMedia"
          icon-left="fas fa-file-download"
          icon-pack="fas"
          :disabled="btnDisable == true"
          variant="success"
        >{{ $t("Modules.ET.optExpType.lblBtnExportMedia") }}</b-button>
      </div>
      <br>
      <b-container fluid> <!-- Status -->
        <b-row>
          <b-col sm="2">
            <label for="status">{{ $t('Modules.ET.Status.Status') }}:</label>
          </b-col>
          <b-col sm="10">
            <b-form-textarea
              id="status"
              v-bind:placeholder="$t('Modules.ET.Status.Status')"
              v-model="statusMsg"
              :disabled=true
              rows="1"
              max-rows="8">
            </b-form-textarea>
          </b-col>
        </b-row>
      </b-container>
    </div>
  </b-container>
</template>

<script>
  import { et } from "./scripts/et";
  import i18n from '../../../i18n';
  import { wtconfig } from '../General/wtutils';
  import { etHelper } from "./scripts/ethelper";


  const log = require("electron-log");
  export default {
      data() {
        return {
          exportLevels: [],
          optExpTypeMain: [
            {
              "text": i18n.t('Modules.ET.optExpType.MainMovie'),
              "value": et.ETmediaType.Movie
            },
            {
              "text": i18n.t('Modules.ET.optExpType.MainTV'),
              "value": et.ETmediaType.Show
            },
            {
              "text": i18n.t('Modules.ET.optExpType.MainAudio'),
              "value": et.ETmediaType.Artist
            },
            {
              "text": i18n.t('Modules.ET.optExpType.MainPhoto'),
              "value": et.ETmediaType.Photo
            },
            {
              "text": i18n.t('Modules.ET.optExpType.MainPlaylist'),
              "value": et.ETmediaType.Playlist
            },
            {
              "text": i18n.t('Modules.ET.optExpType.MainLibrary'),
              "value": et.ETmediaType.Library
            }
          ],
          optExpTypeSec: [],
          selExpTypeMain: "",
          selExpTypeSec: "",
          selLevel: "",
          selLibrary: "",
          selLibraryOptions: [],
          selLibraryWait: true,
          selMediaType: "",
          selPType: "audio",
          pListGrpDisabled: true,
          etLibraryGroupDisabled: false,
          etLevelGroupDisabled: false,
          statusMsg: 'Idle'
        };
  },
  watch: {
    // Watch for status update
    ETStatus: function() {
      this.statusMsg = this.$store.getters.getETStatus;
      //this.genStatusMsg();
    },
    // Watch for when selected server address is updated
    selectedServerAddress: async function(){
      // Changed, so we need to update the libraries
      this.selLibraryWait = true;
      this.selLibrary = '';
      this.selLevel = "";
      this.selMediaType = "";
      this.selExpTypeMain = "";
      this.selExpTypeSec = "";
      this.btnDisable=!(this.selLibrary!=='Loading...' && this.selLevel!=='');
      await this.getPMSSections();
      this.selLibraryWait = true;
    },
    selMediaType: async function(){
      this.selLevel = "";
      this.selLibrary = "";
    },
    selectedServerAddressUpdateInProgress: async function(){
      this.selLibraryWait = false;
    },
  },
  created() {
    log.info("ET Created");
    et.updateStatusMsg( et.rawMsgType.Status, i18n.t("Modules.ET.Status.Idle"));
  },
  computed: {
    ETStatus: function(){
      return this.$store.getters.getETStatus;
    },
    btnDisable: function(){
      if (this.selLevel !== "" && this.selLibrary!=='')
      {
        return false;
      }
      else if ( this.selExpTypeSec == et.ETmediaType.Libraries)
      {
        //this.$store.commit("UPDATE_EXPORTLEVEL", 'all');
        return false;
      }
      else if (this.selExpTypeSec == et.ETmediaType.Playlists)
      {
        //this.$store.commit("UPDATE_EXPORTLEVEL", 'all');
        return false;
      }
      else
      {
        return true;
      }
    },
    selectedServerAddress: function(){
      return this.$store.getters.getSelectedServerAddress
    },
    selectedServerAddressUpdateInProgress(){
      return this.$store.getters.getSelectedServerAddressUpdateInProgress
    },
  },
  methods: {
    // Get levels for the selected media type
    getLevels: async function(){
      log.verbose(`Getting levels for: ${this.selExpTypeSec}`);
      this.exportLevels = [];
      const etLevel = et.getLevels(this.selExpTypeSec);
      const etCustomLevel = et.getCustomLevels(this.selExpTypeSec);
      const options = []
      const item = {}
      let custLabel = {}
      custLabel['text']=this.$t('Modules.ET.Custom.CustomLevels');
      custLabel['disabled']=true;
      custLabel['value']='';
      options.push(custLabel);
      Object.keys(etCustomLevel).forEach(function(key) {
        let option = {}
        option['value'] = etCustomLevel[key];
        if (key === "No Level Yet") {
          option['text']=i18n.t('Modules.ET.NoLevelFound');
          option['disabled'] = true;
        }
        else { option['text'] = key; }
        options.push(option);
      });
      let buildinLabel = {}
      buildinLabel['text']=this.$t('Modules.ET.BuildInLevels');
      buildinLabel['disabled']=true;
      buildinLabel['value']='';
      options.push(buildinLabel);
      Object.keys(etLevel).forEach(function(key) {
        let option = {}
        option['value'] = etLevel[key];
        if (key === "No Level Yet") {
          option['text']=i18n.t('Modules.ET.NoLevelFound');
          option['disabled'] = true;
        }
        else { option['text'] = key; }
        if (wtconfig.get('Developer.showDevLevels'))
        {
          options.push(option);
        }
        else
        {
          if (!option['text'].startsWith('dev'))
          {
            options.push(option);
          }
        }
      });
      item['options']=options;
      this.exportLevels = options;
    },
    // Get libraries for selected type
    getLibs: async function(){
      log.verbose('Getting list of libraries');
      log.verbose(`Target is: ${this.selMediaType}`);
      this.selLibraryOptions = [];
      let reqType;
      switch(this.selMediaType) {
        case et.ETmediaType.Episode:
          reqType = et.ETmediaType.Show;
          break;
        case et.ETmediaType.Album:
          reqType = et.ETmediaType.Artist;
          break;
        case et.ETmediaType.Track:
          reqType = et.ETmediaType.Artist;
          break;
        default:
          reqType = this.selMediaType
      }
      reqType = (et.RevETmediaType[reqType]).toString().toLowerCase();
      this.selLibrary = "";
      await this.$store.dispatch('fetchSections')
      const sections = await this.$store.getters.getPmsSections;
      //const pListType = this.$store.getters.getSelectedPListType;
      if (Array.isArray(sections) && sections.length) {
        sections.forEach(req => {
          //if (req.type == this.selMediaType) {
          if (req.type == reqType) {
            if (reqType == 'playlist')
            {
              if (req.playlistType == (et.RevETmediaType[this.selExpTypeSec]).toString().toLowerCase())
              {
                log.debug(`pushing library: ${req.title} to results`);
                let item = [];
                item['text']=req.title;
                item['value']=req.key;
                this.selLibraryOptions.push(Object.assign({}, item));
              }
            }
            else
            {
              log.debug(`pushing library: ${req.title} to results`);
              let item = [];
              item['text']=req.title;
              item['value']=req.key;
              this.selLibraryOptions.push(Object.assign({}, item));
            }
          }
        });
      } else {
        log.error("No Library found");
        this.selLibraryOptions.push["No Library found"];
      }
      log.verbose(`Sections to select among are: ${JSON.stringify(this.selLibraryOptions)}`);
    },
    selLibraryChanged: async function(){
      log.verbose(`Library key to export selected as: ${this.selLibrary}`);
      etHelper.Settings.selLibKey = this.selLibrary;

    },
    selExpTypeSecChanged: async function(){
      // Triggers when exp type is changed
      log.verbose(`Secondary export type selected as: ${arguments[0]}`);
      // Set selMediaType to the type we want, and has to handle exceptions
      switch(arguments[0]) {
        // Set type for episodes to shows
        case et.ETmediaType.Episode:
          // TV Episodes Selected
          this.selMediaType = et.ETmediaType.Show
          break;
        // Set type for playlist audio to playlist
        case et.ETmediaType.Playlist_Audio:
          // TV Episodes Selected
          this.selMediaType = et.ETmediaType.Playlist
          break;
        // Set type for playlist audio to playlist
        case et.ETmediaType.Playlist_Video:
          // TV Episodes Selected
          this.selMediaType = et.ETmediaType.Playlist
          break;
        // Set type for playlist audio to playlist
        case et.ETmediaType.Playlist_Photo:
          // TV Episodes Selected
          this.selMediaType = et.ETmediaType.Playlist
          break;
        default:
          this.selMediaType = arguments[0]
          break;
      }
      log.verbose(`Export Sec type selected: ${arguments[0]}`);
      if ( arguments[0] == et.ETmediaType.Libraries)
      {
        log.info('Exporting library info');
      }
      else
      {
        this.getLibs();
        this.getLevels();
      }
    },
    selExpTypeMainChanged: async function(){
      this.optExpTypeSec = [];
      this.selLibrary = '';
      this.selLibraryOptions = [];
      this.exportLevels = [];
      this.selExpTypeMain = arguments[0];
      console.log('Ged 99: ' + JSON.stringify(arguments[0]))
      console.log('Ged 99-2: ' + JSON.stringify(et.selSecOption[arguments[0]]))
      console.log('Ged 99-3: ' + i18n.t('Modules.ET.optExpType.SecMovies'))
      console.log('Ged 99-4: ' + JSON.stringify(et.selSecOption2[arguments[0]]))
      
      this.optExpTypeSec = et.selSecOption[arguments[0]]
      log.verbose(`Export Main type selected: ${arguments[0]}`);
    },
    getPMSSections: async function(){
      this.selLibrary = "";
      await this.$store.dispatch('fetchSections')
      const sections = await this.$store.getters.getPmsSections;
      const result = [];
      // Alter target due to some exports share lib types
      switch(this.selMediaType) {
        case 'episode':
          this.selMediaType = 'show';
          break;
        case 'track':
          this.selMediaType = 'artist';
          break;
        case 'album':
          this.selMediaType = 'artist';
          break;
        default:
          log.error(`getPMSSections had an unknown selMediaType as: ${this.selMediaType}`);
      }

      const pListType = this.$store.getters.getSelectedPListType;
      if (Array.isArray(sections) && sections.length) {
        sections.forEach(req => {
          if (req.type == this.selMediaType) {
            if (this.selMediaType == 'playlist')
            {
              if (req.playlistType == pListType)
              {
                log.debug(`pushing library: ${req.title} to results`);
                let item = [];
                item['text']=req.title;
                item['value']=req.key;
                result.push(Object.assign({}, item));
              }
            }
            else
            {
              log.debug(`pushing library: ${req.title} to results`);
              let item = [];
              item['text']=req.title;
              item['value']=req.key;
              result.push(Object.assign({}, item));
            }
          }
        });
      } else {
        log.error("No Library found");
        result.push["No Library found"];
      }
      this.selLibraryOptions = result;
    },
    async getMedia() {
      log.info("getMedia Called");
      if (wtconfig.get('General.ExportPath', "") == "")
      {
        log.info('ET: No output dir defined')
        this.$bvToast.toast(this.$t("Common.ErrorNoOutDirMsg"), {
          title: this.$t("Common.ErrorNoOutDirTitle"),
          autoHideDelay: 3000,
          solid: true,
          variant: 'primary',
          toaster: 'b-toaster-bottom-right'
        })
        return
      }
      et.clearStatus();
      et.updateStatusMsg( et.rawMsgType.Status, i18n.t("Modules.ET.Status.Running"));
      // Populate et. settings with the selected values
      et.expSettings.baseURL = this.$store.getters.getSelectedServerAddress;
      et.expSettings.accessToken = this.$store.getters.getSelectedServerToken;
      console.log('Ged below depreciated')
      et.expSettings.libType = this.selMediaType;
      et.expSettings.libTypeSec = this.selExpTypeSec;
      et.expSettings.exportLevel = this.selLevel;

      console.log('Ged USE below')
      etHelper.Settings.libType = this.selMediaType;
      etHelper.Settings.Level = this.selLevel;
      etHelper.Settings.libTypeSec = this.selExpTypeSec;

      await et.exportMedias();
    },
    async checkSrvSelected() {
      log.debug("checkSrvSelected started");
      let serverCheck = this.$store.getters.getSelectedServer;
      if (serverCheck == "none") {
        log.debug("serverCheck is none");
        this.$bvToast.toast(this.$t("Modules.ET.ErrorNoServerSelectedMsg"), {
          title: this.$t("Modules.ET.ErrorNoServerSelectedTitle"),
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
