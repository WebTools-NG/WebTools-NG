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
        <b-modal ref="showUpdate" hide-footer v-bind:title=this.updateTitle >
          <div class="d-block text-center">
            {{ this.body }}
          </div>
          <b-button class="mt-3" variant="outline-primary" block @click="visitRels">{{ this.body2 }}</b-button>
        </b-modal>
        
  </b-container>
  
</template>

<script>
const log = require('electron-log');
console.log = log.log;
import i18n from '../../../i18n';
import {wtutils, wtconfig, github} from '../General/wtutils';
import { shell } from 'electron';
export default {
  data() {
    return {
      updateTitle: this.$t('Common.Update.Title'),
      //name: '',
      body: '',
      body2: this.$t('Common.Update.Body2'),
      url: ''
    }
  },
  mounted() {
    log.info("About Mounted");    
    this.checkLangUpdates();
    this.UpdatePresent();    
  },
  methods: {
    // Visit GitHub release page
    visitRels(){
      log.info(`User pressed update link, and was directed to: ${this.url}`);
      shell.openExternal(this.url);      
    },
    // Is an update present?
    async UpdatePresent(){      
      // Get release page from GitHub
      const releases = await github.Releases();      
      for(var i = 0; i < releases.length; i++)
      {
          // Check for current release on GitHub
          if ( Boolean(wtconfig.get('Update.Beta')) == releases[i].prerelease){                                      
              if ('v' + wtutils.AppVersion != releases[i].tag_name){                    
                  log.info('Update detected');
                  this.body = this.$t('Common.Update.Body', [releases[i].name, releases[i].published_at.substring(0, 10)]),                                                           
                  this.name = releases[i].name;                    
                  this.url = releases[i].html_url
                  this.$refs['showUpdate'].show()
              }                
              break;
          }
      }
    },
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
