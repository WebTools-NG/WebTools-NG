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

    <div class="container">
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
    </div>
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
export default {
  name: 'export',
  data() {
    return {
      radio: 'movie',
    }
  },
  created(){  
    console.log("ET Created")
    this.fetchSelection()
  }, computed: {
      pmsSections: function(){
          let sections = this.$store.getters.getPmsSections
          let result=[];
          if(Array.isArray(sections) && sections.length){
            console.log("doing a forEach")
                sections.forEach((req) => {
              if (req.type == this.radio) {
                console.log("pushing data to results")
                  result.push(req);
                }
              })
          } else {
            console.log("No data found")
            result.push["No Section found"]
          }
        return result
      }
  }, methods: {
        selectSelection: function (selected) {
          console.log(selected)
          this.$store.commit("UPDATE_SELECTEDSECTION", selected);
        },
        getMedia(){
          console.log("getMedia Called")
              this.$store.dispatch('getMediaMovies');
        },
        fetchSelection(){
          console.log("fetchSelection")
          let serverCheck = this.$store.getters.getSelectedServer
            if(serverCheck !== "none"){

              console.log("serverCheck is not null, running fetchSections ")
              this.$store.dispatch('fetchSections')
          } else {
              console.log("serverCheck is none")
               this.$buefy.toast.open({
                  duration: 3000,
                  message: `No server selected`,
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
