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
        };
  },
  watch: {
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
    selLibrary: async function(){
      this.$store.commit("UPDATE_SELECTEDSECTION", this.selLibrary);
    },
    selMediaType: async function(){
      this.$store.commit("UPDATE_SELECTEDLIBTYPE", this.selMediaType);
      this.selLevel = "";
      this.selLibrary = "";
    },
    selLevel: async function(){
      this.$store.commit("UPDATE_EXPORTLEVEL", this.selLevel);
      
    },

/* 
    selLibrary: async function(){
      if (['libraryInfo', 'playlistInfo'].indexOf(this.selMediaType) > -1)
      {
        this.btnDisable = false;
        this.selMediaType = '';
        this.$store.commit("UPDATE_SELECTEDLIBTYPE", this.selMediaType);
        this.selLevel = 'all';
        this.$store.commit("UPDATE_EXPORTLEVEL", this.selLevel);
        this.selPType = '';
        this.$store.commit("UPDATE_SELECTEDPLISTTYPE", this.selPType);
      }
      else
      {
        this.btnDisable=!(this.selLibrary!=='Loading...' && this.selLevel!=='');
      }
    },
 */

    /* 
    selMediaType: async function(){
      if (['libraryInfo', 'playlistInfo'].indexOf(this.selMediaType) > -1)
      {
        this.btnDisable = false
      }
      else
      {
        this.btnDisable=!(this.selLibrary!=='Loading...' && this.selLevel!=='');
      }
      this.pListGrpDisabled = (this.selMediaType == 'playlist');
    },
 */
    selectedServerAddressUpdateInProgress: async function(){
      this.selLibraryWait = false;
    },

/* 
    selLevel: async function(){
      if (['libraryInfo', 'playlistInfo'].indexOf(this.selMediaType) > -1)
      {
        this.btnDisable = false
      }
      else
      {
        this.btnDisable=!(this.selLibrary!=='Loading...' && this.selLevel!=='');
      }
    },
 */

    selPType: async function(){
      this.$store.commit("UPDATE_SELECTEDPLISTTYPE", this.selPType);
    }
  },
  created() {
    log.info("ET Created");
    //this.$store.commit("UPDATE_SELECTEDLIBTYPE", this.selMediaType);
    this.$store.commit("UPDATE_EXPORTSTATUS", i18n.t("Modules.ET.Status.Idle"));
    // this.$store.commit("UPDATE_SELECTEDPLISTTYPE", this.selPType);
    this.checkSrvSelected();
  },
  computed: {
    btnDisable: function(){
      console.log('Ged 88 Btn Disable', this.selLevel, 'lib',this.selLibrary)
      if (this.selLevel !== "" && this.selLibrary!=='')
      {
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
    statusMsg: function(){
      return this.$store.getters.getExportStatus
    },



/* 
    exportLevels: function() {
      et.getLevelDisplayName('My Level', this.selMediaType);
      // Returns valid levels for selected media type
      let exportType = this.selMediaType;
      if (exportType == 'playlist')
      {
        exportType = exportType + '-' + this.selPType;
      }
      const etLevel = et.getLevels(exportType);
      const etCustomLevel = et.getCustomLevels(exportType);
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
      return options;
    }
  */

  },
  methods: {
    // Get levels for the selected media type
    getLevels: async function(){
      log.verbose(`Getting levels for: ${this.selExpTypeSec}`);
      console.log('Ged 0 level types', this.selExpTypeSec)
      this.exportLevels = [];
      let etLevelType;
      switch(this.selExpTypeSec) {
        case i18n.t('Modules.ET.optExpType.SecMovies'):
          // Movie Selected
          etLevelType = 'movie'
          break;
        case i18n.t('Modules.ET.optExpType.SecTVSeries'):
          // TV Shows Selected
          etLevelType = 'show'
          break;
        case i18n.t('Modules.ET.optExpType.SecTVEpisodes'):
          // TV Episodes Selected
          etLevelType = 'episode'
          break;
        case i18n.t('Modules.ET.optExpType.SecAudioAlbum'):
          // TV Episodes Selected
          etLevelType = 'album'
          break;
        case i18n.t('Modules.ET.optExpType.SecAudioArtist'):
          // TV Episodes Selected
          etLevelType = 'artist'
          break;
        case i18n.t('Modules.ET.optExpType.SecAudioTrack'):
          // TV Episodes Selected
          etLevelType = 'track'
          break;
        case i18n.t('Modules.ET.optExpType.SecPhotos'):
          // TV Episodes Selected
          etLevelType = 'photo'
          break;
      }
      
      const etLevel = et.getLevels(etLevelType);
      console.log('Ged 1', JSON.stringify(etLevel))
      const etCustomLevel = et.getCustomLevels(etLevelType);
      console.log('Ged 2', JSON.stringify(etCustomLevel))
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
      log.verbose(`Target is: ${this.selMediaType}`)
      this.selLibrary = "";
      await this.$store.dispatch('fetchSections')
      const sections = await this.$store.getters.getPmsSections;
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
      log.verbose(`Library key to export selected as: ${arguments[0]}`);
      

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
      console.log('Ged 87',this.selMediaType, 'input', arguments[0])
      this.getLibs();
      this.getLevels();
    },
    selExpTypeMainChanged: async function(){
      this.optExpTypeSec = [];
      this.selLibrary = '';
      this.selLibraryOptions = [];
      this.exportLevels = [];
      this.selExpTypeMain= arguments[0];
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
    getMedia() {
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
      this.$store.commit("UPDATE_EXPORTLEVEL", this.selLevel);
      this.$store.commit("UPDATE_SELECTEDSECTION", this.selLibrary);
      this.$store.commit("UPDATE_EXPORTSTATUS", i18n.t("Modules.ET.Status.StartExport"));
      this.$store.dispatch("exportMedias");
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
