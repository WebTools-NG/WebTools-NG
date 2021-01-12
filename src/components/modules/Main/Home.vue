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
            <dt>{{ $t("Modules.PMS.Name") }}</dt>
              <dd>* {{ $t("Modules.PMS.Description") }} </dd>
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
    log.info("Home Created");    
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
      log.verbose('Github releases', JSON.stringify(releases))      
      if (wtconfig.get('Update.Beta'))
      {
        // Need to check both beta and rel versions        
        // Find newest one
        if (Date.parse(releases['betadateFull']) > Date.parse(releases['reldateFull'])){          
          this.body = this.$t('Common.Update.Body', [releases['betaname'], releases['betadate']]),                                                           
          this.name = releases['betaname'];                    
          this.url = releases['betaurl'];
          this.ver = releases['betaver'];
        }
        else
        {          
          this.body = this.$t('Common.Update.Body', [releases['relname'], releases['reldate']]),                                                           
          this.name = releases['relname'];                    
          this.url = releases['relurl'];
          this.ver = releases['relver'];
        }
      }
      else
      {        
        this.body = this.$t('Common.Update.Body', [releases['relname'], releases['reldate']]),                                                           
        this.name = releases['relname'];                    
        this.url = releases['relurl'];
        this.ver = releases['relver'];
      }

      if (wtutils.AppVersion != this.ver && this.ver)
      {        
        // Show an update is present
        log.debug(`Update present: Github-Version: ${this.ver} Current-Version: ${wtutils.AppVersion}`)
        this.$refs['showUpdate'].show();
      }



      /* 
      if (( Boolean(wtconfig.get('Update.Beta')) == releases['beta']))
      {
        log.verbose('Need to check for beta updates', releases['betaver'], wtutils.AppVersion)
        if (releases['betaver'] != wtutils.AppVersion)
        {
          console.log('ged beta update avail')
          log.info('Beta Update detected');
          this.body = this.$t('Common.Update.Body', [releases['betaname'], releases['betadate']]),                                                           
          this.name = releases['betaname'];                    
          this.url = releases['betaurl'];
          this.$refs['showUpdate'].show();
        }        
      }
      else
      {
        console.log('ged rel', releases['relver'] )
        log.verbose('Need to check for rel updates', releases['relver'], wtutils.AppVersion)
        
        
        if (releases['relver'] === null)
        {
          console.log('Ged3344 rel is null')
        }
        if ((releases['relver'] != wtutils.AppVersion) ?? (releases['relver'] !== null))
        {          
          log.info('Release Update detected');
          this.body = this.$t('Common.Update.Body', [releases['relname'], releases['reldate']]),                                                           
          this.name = releases['relname'];                    
          this.url = releases['relurl'];
          this.$refs['showUpdate'].show();
        }
      }
       */

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
