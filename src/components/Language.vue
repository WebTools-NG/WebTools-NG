<template>
  <section class="section">
    <h1 class="title is-2">{{ $t("Common.Language.Name") }}</h1>    
    <h2 class="subtitle">{{ $t("Common.Language.Description") }}</h2>
    <br>     
    <div class="control has-icons-left">
      <div class="locale-changer select is-dark is-medium" >            
        <b-form-select id="langselect" @change.native="onChange($event)" v-model="$i18n.locale" :options="olLangs"></b-form-select>
      </div>
      <span class="icon is-medium is-left">
            <i class="fas fa-globe"></i>            
      </span>
      <button id="btnDownload" v-on:click="forcedownload">{{ $t("Common.Language.btnForce") }}</button>
    </div>
  </section>
</template>

<script>
// User Config
import i18n from '../i18n';
const log = require('electron-log');

export default {
  name: 'locale-changer',
  data () {
    return {      
      olLangs: []      
    }
  },  
  mounted() {
    log.info("About Mounted");    
    this.getOnlineLangs();    
  },
  methods: {
    forcedownload() {       
      this.$store.dispatch("updateAndSetLang",  { "langCode": i18n.locale, "forceDownload": true});      
    },
    getOnlineLangs() {      
      var onlineLangs = this.$store.getters.getLanguages      
      for (var i=0; i<onlineLangs.length; i++) {       
        var langName = onlineLangs[i]['name'] + ' (' + onlineLangs[i]['percentage'] + '%)';
        const entry = {}
        entry['text'] = langName        
        entry['value'] = onlineLangs[i]['code']
        this.olLangs.push(entry)
      }      
    },    
    onChange(event) {          
      this.$store.dispatch('updateAndSetLang', { "langCode": event.target.value, "forceDownload": false});
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .langselect{
    margin-right:10px;
  }
  .btnDownload{
    margin-left: 10px;
  }

</style>
