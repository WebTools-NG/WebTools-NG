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
          :options="optionsMediaType"
          name="mediaType"
        ></b-form-radio-group>
      </b-form-group>
    </div>    

    <div> <!-- Select Library -->
      <b-form-group id="etLibraryGroup" v-bind:label="$t('Modules.ET.HSelectSelection')" label-size="lg" label-class="font-weight-bold pt-0">
        <b-tooltip target="etLibraryGroup" triggers="hover">
          {{ $t('Modules.ET.TT-ETLibrary') }}
        </b-tooltip>
        <b-form-select 
          v-model="selLibrary" 
          name="selLibrary"
          id="selLibrary">                   
          <option
            v-for="option in pmsSections"
            :value="option.key"
            :key="option.key"
            v-on:change="onchange()">
            {{ option.title }}
          </option>          
        </b-form-select>
      </b-form-group>
    </div>   

    <div> <!-- Select Export Level -->    
      <b-form-group id="etLevelGroup" v-bind:label="$t('Modules.ET.ExportLevel')" label-size="lg" label-class="font-weight-bold pt-0">  
        <b-tooltip target="etLevelGroup" triggers="hover">
          {{ $t('Modules.ET.TT-ETLevel') }}
        </b-tooltip>            
        <b-form-select
          v-model="selLevel"
          id="selLevel"
          :options="exportLevels">         
        </b-form-select>
      </b-form-group>           
    </div> 
    


<!-- 
    <b-button
      id="sync-button"
      @click="fetchSelection"
      type="is-warning"
      icon-left="fas fa-sync"
      icon-pack="fas"
    ></b-button>
    <hr />

    -->


 

    <h1 class="title is-3">{{ $t("Modules.ET.HExportMedia") }}</h1>
    <div class="buttons">
      <b-button
        type="is-primary"
        @click="getMedia"
        icon-left="fas fa-file-download"
        icon-pack="fas"
      >{{ $t("Modules.ET.HExportMedia") }}</b-button>
    </div>  
  </section>
</template>

<script>
  import { et } from "./et";  
  import i18n from '../../../i18n';
  const log = require("electron-log");
  export default {
      data() {
        return {
          radio: "movie",
          activeTab: 0,
          selMediaType: 'movie',
          selLibrary: '',
          selLevel: '',
          optionsMediaType: [
            { text: 'Movies', value: 'movie', disabled: false },            
            { text: 'Shows', value: 'show', disabled: false },            
            { text: 'Artist', value: 'artist', disabled: true },
            { text: 'Photos', value: 'photo', disabled: true },
            { text: 'Other Videos', value: 'other', disabled: true }
          ]
        };
  },
  created() {
    log.info("ET Created");
    this.fetchSelection();
  },
  computed: {
    pmsSections: function() {
      const sections = this.$store.getters.getPmsSections;
      const result = [];
      if (Array.isArray(sections) && sections.length) {                
        sections.forEach(req => {
          if (req.type == this.selMediaType) {
            log.debug(`pushing library: ${req.title} to results`);            
            result.push(req);
          }
        });
      } else {
        log.error("No Library found");
        result.push["No Library found"];
      }      
      return result;
    },
    exportLevels: function() {      
      // Returns valid levels for selected media type
      const etLevel = et.getLevels(this.selMediaType);
      const etCustomLevel = et.getCustomLevels(this.selMediaType);      
      const options = []
      const item = {}
      let custLabel = {}
      custLabel['text']=this.$t('Modules.ET.CustomLevels');      
      custLabel['disabled']=true;
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
    }
  },
  methods: {
    selectSelection: function(selected) {
      log.debug(selected);
      this.$store.commit("UPDATE_SELECTEDSECTION", selected);
    },
    selectExportLevel: function(selected) {
      log.info('selectExportLevel: Selected Level: ' + selected);
      this.$store.commit("UPDATE_EXPORTLEVEL", selected);
    },
    getMedia() {
      log.info("getMedia Called");
      this.$store.dispatch("getMediaMovies");
    },
    fetchSelection() {
      log.debug("fetchSelection");
      let serverCheck = this.$store.getters.getSelectedServer;
      if (serverCheck !== "none") {
        log.debug("serverCheck is not null, running fetchSections ");
        this.$store.dispatch("fetchSections");
      } else {
        log.debug("serverCheck is none");
        this.$buefy.toast.open({
          duration: 3000,
          message: this.$t("Modules.ET.ErrorNoServerSelected"),
          type: "is-danger"
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
