<template>
  <section class="section">
    <h1 class="title is-3">{{ $t("Modules.ET.Name") }}</h1>
    <h2 class="subtitle">{{ $t("Modules.ET.Description") }}</h2>
    <br />


    
    <div> <!-- Media type to export -->      
      <b-form-group id="etTypeGroup" v-bind:label="$t('Modules.ET.HSelectMedia')" label-size="lg" label-class="font-weight-bold pt-0">
        <b-tooltip target="etTypeGroup" triggers="hover">
          {{ $t('Modules.ET.TT-ETType') }}
        </b-tooltip>
        <b-form-radio-group
          id="mediaType"
          v-model="selMediaType"
          @change.native="changeType()"
          :options="optionsMediaType"
          name="mediaType"
        ></b-form-radio-group>
      </b-form-group>
    </div>
    <div class="d-flex align-items-center">
      <b-form-group id="etLibraryGroup" v-bind:label="$t('Modules.ET.HSelectSelection')" label-size="lg" label-class="font-weight-bold pt-0">        
        <div ref="libSpinner" id="libSpinner" :hidden="selLibraryWait">
          <b-spinner id="libLoad" class="ml-auto text-danger"></b-spinner>
        </div>
        <b-tooltip target="etLibraryGroup" triggers="hover">
          {{ $t('Modules.ET.TT-ETLibrary') }}
        </b-tooltip>
        <b-form-select 
          v-model="selLibrary"          
          id="selLibrary"
          @change.native="enableBtnExport"
          :options="selLibraryOptions"
          name="selLibrary">        
        </b-form-select>
      </b-form-group>      
    </div>    

    <div> <!-- Select Export Level -->    
      <b-form-group id="etLevelGroup" v-bind:label="$t('Modules.ET.ExportLevel')" label-size="lg" label-class="font-weight-bold pt-0">  
        <b-tooltip target="etLevelGroup" triggers="hover">
          {{ $t('Modules.ET.TT-ETLevel') }}
        </b-tooltip>            
        <b-form-select
          class="form-control"
          v-model="selLevel"
          id="selLevel"          
          @change.native="selectExportLevel()"
          :options="exportLevels"
          name="selLevel">         
        </b-form-select>
      </b-form-group>     
    </div>

    <div class="buttons">
      <b-button
        type="is-primary"
        @click="getMedia"
        icon-left="fas fa-file-download"
        icon-pack="fas"
        :disabled="btnDisable == true"
        variant="success"
      >{{ $t("Modules.ET.HExportMedia") }}</b-button>
    </div>        
    <b-container fluid>
    <b-row>
      <b-col sm="2">
        <label for="status">{{ $t('Modules.ET.Status.Status') }}:</label>
      </b-col>
      <b-col sm="10">
        <b-form-textarea
          id="status"          
          v-bind:placeholder="$t('Modules.ET.Status.Status')"
          v-model="count"
          :disabled=true
          rows="1"
          max-rows="8"
        ></b-form-textarea>
      </b-col>
    </b-row>
  </b-container>
 
  
  </section>
</template>

<script>
  import { et } from "./et";  
  import i18n from '../../../i18n';
  import store from '../../../store';
  import { wtconfig } from '../../../wtutils';
  
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
          selLevelName: "",
          optionsMediaType: [
            { text: i18n.t('Modules.ET.RadioMovies'), value: 'movie', disabled: false },            
            { text: i18n.t('Modules.ET.RadioTVSeries'), value: 'show', disabled: true },            
            { text: i18n.t('Modules.ET.RadioMusic'), value: 'artist', disabled: true },
            { text: i18n.t('Modules.ET.RadioPhotos'), value: 'photo', disabled: true },
            { text: i18n.t('Modules.ET.RadioOtherVideos'), value: 'other', disabled: true }
          ]          
        };
  },
  watch: {
    // Watch for when selected server address is updated
    selectedServerAddress: async function(){
      // Changed, so we need to update the libraries       
      this.selLibraryWait = false;      
      this.selLibrary = '';                                                     
      await this.getPMSSections();            
      this.selLibraryWait = true;             
    },
    selectedServerAddressUpdateInProgress: async function(){
      this.selLibraryWait = false;            
    }
  },
  created() {
    log.info("ET Created");
    this.$store.commit("UPDATE_SELECTEDLIBTYPE", this.selMediaType);
    this.$store.commit("UPDATE_EXPORTSTATUS", i18n.t("Modules.ET.Status.Idle"));
    this.fetchSelection();
  },
  computed: {
    selectedServerAddress: function(){
        return this.$store.getters.getSelectedServerAddress
    },  
    selectedServerAddressUpdateInProgress(){
        return this.$store.getters.getSelectedServerAddressUpdateInProgress
    },  
    exportLevels: function() {         
      et.getLevelDisplayName('My Level', this.selMediaType)
      // Returns valid levels for selected media type
      const etLevel = et.getLevels(this.selMediaType);
      const etCustomLevel = et.getCustomLevels(this.selMediaType);      
      const options = []
      const item = {}
      let custLabel = {}
      custLabel['text']=this.$t('Modules.ET.CustomLevels');      
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
        options.push(option);        
      });      
      item['options']=options;      
      return options;              
    },
    count () {      
      return store.getters.getExportStatus
    }
  },
  methods: {
    getPMSSections: async function(){
      
      this.selLibrary = "Loading...";
      await this.$store.dispatch('fetchSections')
      const sections = await this.$store.getters.getPmsSections;      
      const result = [];      
      if (Array.isArray(sections) && sections.length) {                
        sections.forEach(req => {          
          if (req.type == this.selMediaType) {
            log.debug(`pushing library: ${req.title} to results`);
            let item = [];            
            item['text']=req.title;
            item['value']=req.key;                       
            result.push(Object.assign({}, item));
          }
        });
      } else {
        log.error("No Library found");
        result.push["No Library found"];
      }
      this.selLibraryOptions = result;         
    },
    selectSelection: function(selected) {
      log.debug(selected);
      this.$store.commit("UPDATE_SELECTEDSECTION", selected);
    },    
    enableBtnExport: function() {
      // Enables export button only if both library and level is selected        
      this.btnDisable=(this.selLibrary=='' && this.selLevel=='')                    
    },
    changeType: function() {
      // Triggers when lib type is changed
      this.selLibrary = '';
      this.selLevel = '';  
      this.$store.commit("UPDATE_SELECTEDLIBTYPE", this.selMediaType);
    },
    selectExportLevel: function() {      
      this.enableBtnExport();
    },    
    getMedia() {
      log.info("getMedia Called");
      if (wtconfig.get('ET.OutPath', "") == "")
      {
        log.info('ET: No output dir defined')        
        this.$bvToast.toast(this.$t("Modules.ET.ErrorNoOutDirMsg"), {
          title: this.$t("Modules.ET.ErrorNoOutDirTitle"),
          autoHideDelay: 3000,          
          solid: true,
          variant: 'primary',
          toaster: 'b-toaster-bottom-center' 
        })        
        return
      }
      this.$store.commit("UPDATE_EXPORTLEVEL", this.selLevel);      
      this.$store.commit("UPDATE_SELECTEDSECTION", this.selLibrary);
      this.$store.commit("UPDATE_EXPORTSTATUS", i18n.t("Modules.ET.Status.StartExport"));                     
      this.$store.dispatch("exportMedias");
    },
    async fetchSelection() {
      log.debug("fetchSelection");
      let serverCheck = this.$store.getters.getSelectedServer;
      if (serverCheck !== "none") {
        log.debug("serverCheck is not null, running fetchSections ");
        this.getPMSSections();
        //await this.$store.dispatch("fetchSections");
      } else {
        log.debug("serverCheck is none");
        this.$bvToast.toast(this.$t("Modules.ET.ErrorNoServerSelected"), {
           // title: this.$t("Modules.ET.ErrorNoServerSelected"),
            autoHideDelay: 3000,          
            solid: true,
            variant: 'danger',
            //toaster: 'b-toaster-bottom-center'
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
