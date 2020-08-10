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
      <b-button id="btnDownload" variant="success" v-on:click="forcedownload">{{ $t("Common.Language.btnForce") }}</b-button>
    </div>
    <br/>
    <div id="poe">
      <dl>
        <dt>{{ $t("Common.Language.LangMissing") }}:</dt>
        <dd>* {{ $t("Common.Language.LangMissing1") }}</dd>
        <dd>* {{ $t("Common.Language.LangMissing2") }}</dd>
        <dd>* {{ $t("Common.Language.LangMissing3") }}</dd>
        <dd>* {{ $t("Common.Language.LangMissing4") }}</dd>
        <dt>{{ $t("Common.Language.LangSpelling") }}:</dt>
        <dd>* {{ $t("Common.Language.LangSpelling1") }}</dd> 
        <dt>{{ $t("Common.Language.LangProcent") }}</dt>
        <dd>* {{ $t("Common.Language.LangProcent1") }}</dd>
        <dd>* {{ $t("Common.Language.LangProcent2") }}</dd>
        <dt>{{ $t("Common.Language.LangForce") }}</dt>
        <dd>* {{ $t("Common.Language.LangForce1") }}</dd>       
      </dl>       
    </div>
    <div>      
      <b-button variant="success" v-on:click="joinPOE">{{ $t("Common.Language.Join") }}</b-button>      
    </div>
  </section>
</template>

<script>
// User Config
import i18n from '../i18n';
import { shell } from 'electron';
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
    joinPOE() {
      shell.openExternal("https://poeditor.com/join/project/yFjdfkDfup")
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
