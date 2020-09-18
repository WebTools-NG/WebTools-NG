<template>
  <b-container fluid>
        <div class="col-lg-9 col-md-12 col-xs-12">          
          <h2>
            {{ $t("Common.Home.Title") }} <br>
            <h5>{{ $t("Common.Home.About") }}</h5>
          </h2>          
          <br>
          <h3>{{ $t("Common.Home.Modules") }}</h3>
          <dl>
            <dt>{{ $t("Modules.ET.Name") }}</dt>
              <dd>* {{ $t("Modules.ET.Description") }} </dd>
          </dl>              
        </div>
  </b-container>
</template>

<script>
const log = require('electron-log');
console.log = log.log;
import i18n from '../i18n';
import {wtutils, wtconfig} from '../wtutils'
export default {
  mounted() {
    log.info("About Mounted");    
    this.checkLangUpdates();    
  },
  methods: {
    async checkLangUpdates() {
      // Start by getting the currently selected language
      const selLang = wtconfig.get('General.language');
      const selLangUpdated = wtconfig.get(`Languages.${selLang}`, 'N/A')
      var onlineLangs = await this.$store.getters.getLanguages      
      for (var i=0; i<onlineLangs.length; i++) {
        if (onlineLangs[i]['code'] == selLang)
        {
          if ( onlineLangs[i]['updated'] != selLangUpdated)
          {            
            const bodyStr = i18n.t("Common.Home.LangUpdateMsg", [onlineLangs[i]['name']]) + '. ' + i18n.t("Common.Home.LangUpdateMsg2", [i18n.t("Common.Language.btnForce")]);            
            this.$bvToast.toast(bodyStr, {           
              title: this.$t("Common.Home.LangUpdateTitle"),
              autoHideDelay: 400000,                     
              solid: true,
              variant: 'primary',
              toaster: 'b-toaster-bottom-right' 
            });
          }
        }
      }




      selLang, i18n, wtutils, selLangUpdated
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
dd {
  padding-left: 10px;
}

</style>
