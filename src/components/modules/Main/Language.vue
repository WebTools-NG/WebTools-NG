<template>
    <b-container class="m-2 mt-2">
    <div>   <!-- Title and desc -->
      <h2>
        {{ $t(`Common.Language.Name`) }}
      </h2>
      <h5>{{ $t(`Common.Language.Description`) }}</h5>
    </div>
    <div class="control has-icons-left">
      <div class="locale-changer select is-dark is-medium" > <!-- Select Lang -->
        <b-input-group>
        <b-input-group-prepend is-text>
        <b-icon icon="globe2"></b-icon>
        </b-input-group-prepend>
          <b-form-select id="langselect" @change.native="onChange($event)" v-model="$i18n.locale" :options="olLangs" style="width: 50%"></b-form-select>
        </b-input-group>
      </div>
      <p />
      <div class="text-center">
        <b-button id="btnDownload" variant="success" v-on:click="forcedownload">{{ $t("Common.Language.btnForce") }}</b-button>
      </div>
    </div>
    <br/>
    <h5>F.A.Q</h5>
    <div>
      <ul class="list-unstyled">
        <li><strong>{{ $t("Common.Language.LangMissing") }}</strong>
          <ul>
            <li>{{ $t("Common.Language.LangMissing1") }}</li>
            <li>{{ $t("Common.Language.LangMissing2") }}</li>
            <li>{{ $t("Common.Language.LangMissing3") }}</li>
            <li>{{ $t("Common.Language.LangMissing4") }}</li>
          </ul>
        </li>

        <li><strong>{{ $t("Common.Language.LangSpelling") }}</strong>
          <ul>
            <li>{{ $t("Common.Language.LangSpelling1") }}</li>
          </ul>
        </li>

        <li><strong>{{ $t("Common.Language.LangProcent") }}</strong>
          <ul>
            <li>{{ $t("Common.Language.LangProcent1") }}</li>
            <li>{{ $t("Common.Language.LangProcent2") }}</li>
          </ul>
        </li>

        <li><strong>{{ $t("Common.Language.LangForce") }}</strong>
          <ul>
            <li>{{ $t("Common.Language.LangForce1") }}</li>
          </ul>
        </li>
      </ul>
    </div>
    <div class="text-center">
      <b-button variant="success" v-on:click="joinPOE">{{ $t("Common.Language.Join") }}</b-button>
    </div>
  </b-container>
</template>

<script>
// User Config
import i18n from '../../../i18n';
import { shell } from 'electron';
import { wtconfig} from '../General/wtutils'
const log = require('electron-log');
console.log = log.log;

export default {
  name: 'locale-changer',
  data () {
    return {
      olLangs: []
    }
  },
  mounted() {
    log.info("Language Created");
    this.getOnlineLangs();
  },
  methods: {
    async forcedownload() {
      this.olLangs = [];
      await this.$store.dispatch("updateAndSetLang",  { "langCode": i18n.locale, "forceDownload": true});
      this.getOnlineLangs();
      // Get timeStamp
      let timeStamp = ''
      var onlineLangs = await this.$store.getters.getLanguages
      for (var i=0; i<onlineLangs.length; i++) {
        if (onlineLangs[i]['code'] == i18n.locale)
        {
          timeStamp = onlineLangs[i]['updated']
        }
      }
      // Update settings with timestamp
      wtconfig.set(`Languages.${i18n.locale}`, timeStamp)
    },
    joinPOE() {
      shell.openExternal("https://github.com/WebTools-NG/WebTools-NG/wiki/Translator")
    },
    async getOnlineLangs() {
      var onlineLangs = await this.$store.getters.getLanguages
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
