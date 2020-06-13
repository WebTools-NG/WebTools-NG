<template>
  <section class="section">

    <h1 class="title is-3">{{ $t("Modules.ET.Name") }}</h1>    
    <h2 class="subtitle">{{ $t("Modules.ET.Description") }}</h2>
    <br>

    <h1 class="title is-3">{{ $t("Modules.ET.HSelectMedia") }}</h1>
    <div class="block">
      <b-radio v-model="radio" type="is-dark"
          name="movie"
          native-value="movie">
          {{ $t("Modules.ET.RadioMovies") }}
      </b-radio>
      <b-radio v-model="radio" type="is-dark"
            name="tvseries"
            native-value="tvseries"
            disabled>
            {{ $t("Modules.ET.RadioTVSeries") }}
      </b-radio>
      <b-radio v-model="radio" type="is-dark"
            name="artist"
            native-value="artist"
            disabled>
            {{ $t("Modules.ET.RadioMusic") }}
      </b-radio>
      <b-radio v-model="radio" type="is-dark"
            name="photo"
            native-value="photo"
            disabled>
            {{ $t("Modules.ET.RadioPhotos") }}
      </b-radio>
      <b-radio v-model="radio" type="is-dark"
            name="othervideos"
            native-value="othervideos"
            disabled>
            {{ $t("Modules.ET.RadioOtherVideos") }}
      </b-radio>
    </div>
    <hr>

      <h1 class="title is-3">{{ $t("Modules.ET.HSelectSelection") }}</h1>
      <div class="select is-dark"> 
        <b-select v-bind:placeholder="$t('Modules.ET.SelectSelection')"                        
          @input="selectSelection">
            <option
              v-for="option in pmsSections"
              :value="option.key"
              :key="option.key"
              v-on:change="onchange()">
              {{ option.title }}
            </option>
        </b-select> 
      </div>
        <b-button   
          id="sync-button" 
          @click="fetchSelection" type="is-warning"
          icon-left="fas fa-sync" icon-pack="fas"  >
        </b-button>
    <hr>

      <h1 class="title is-3">Export Level</h1>

          <b-tabs v-model="activeTab" type="is-boxed" :animated="false">
            <b-tab-item label="Export Level"> 
              <div class="columns">
                <div class="column is-3">
             <b-field type="is-dark">
                      <b-select
                        placeholder="Default"
                        expanded
                        @input="selectExportLevel">
                        <option
                        v-for="option in levels"
                        :value="option.key"
                        :key="option.key">
                        {{ option.name }}
            </option>
                      </b-select>
                    </b-field>
                    </div>
                    <div class="column is-3">
                    </div>
                <div class="column is-6">  
                   
                <b-message icon-pack="fas" has-icon icon="fas fa-info-circle">
                  Export level determents what data is going to be exportet.
                </b-message>         
                </div>
              </div>
            </b-tab-item>
            <b-tab-item label="Custom Export Level">
            </b-tab-item>
        </b-tabs>
        <hr>
        


      
      

      


    <h1 class="title is-3">{{ $t("Modules.ET.HExportMedia") }}</h1>
    <div class="buttons">
      <b-button 
          type="is-primary" 
          @click="getMedia" 
          icon-left="fas fa-file-download" 
          icon-pack="fas">
          {{ $t("Modules.ET.HExportMedia") }}
        </b-button>
    </div>
  </section>
</template>

<script>
//import  {levels, level1, level2} from '../ExportTools/movieLevels'
const log = require('electron-log');

export default {
  name: 'export',
  data() {
    return {
      radio: 'movie',
      activeTab: 0
//      activeTab: 0,
//      levels: levels,
//      level1: level1,
//      level2: level2
    }
  },
  created(){     
    log.info('ET Created')    
    this.fetchSelection()
    //console.log(level2)
  }, computed: {
      pmsSections: function(){
          let sections = this.$store.getters.getPmsSections
          let result=[];
          if(Array.isArray(sections) && sections.length){
            log.debug("doing a forEach")
                sections.forEach((req) => {
              if (req.type == this.radio) {
                  log.debug("pushing library to results: " + req.title)                                    
                  result.push(req);
                }
              })
          } else {
            log.info("No data found")
            result.push["No Section found"]
          }
        return result
      }
  }, methods: {
        selectSelection: function (selected) {
          log.debug(selected)
          this.$store.commit("UPDATE_SELECTEDSECTION", selected);
        },
        selectExportLevel: function(selected){
          console.log(selected)
          this.$store.commit("UPDATE_EXPORTLEVEL", selected);
        },
        getMedia(){
          console.log("getMedia Called")
              this.$store.dispatch('getMediaMovies');
        },
        fetchSelection(){
          log.debug("fetchSelection")
          let serverCheck = this.$store.getters.getSelectedServer
            if(serverCheck !== "none"){

              log.debug("serverCheck is not null, running fetchSections ")
              this.$store.dispatch('fetchSections')
          } else {
              log.debug("serverCheck is none")
               this.$buefy.toast.open({
                  duration: 3000,
                  message: this.$t('Modules.ET.ErrorNoServerSelected'),
                  type: 'is-danger'
                })
          }
        }     
  }
  
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

#sync-button{
  margin-left: 1em;
}

</style>
