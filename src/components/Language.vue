<template>
  <section class="section">
    <h1 class="title is-2">{{ $t("Common.Language.Name") }}</h1>    
    <h2 class="subtitle">{{ $t("Common.Language.Description") }}</h2>
    <br>
    <div class="control has-icons-left">
    <div class="locale-changer select is-dark is-medium" >
      <select @change="onChange($event)" v-model="$i18n.locale">
        <option v-for="(lang, i) in langs" :key="`Lang${i}`" :value="lang">{{ lang }}</option>
      </select>
    </div>
        <span class="icon is-medium is-left">
            <i class="fas fa-globe"></i>
        </span>
    </div>
  </section>
</template>

<script>
// User Config
const wtconfig = require('../wtconfig');

export default {
  name: 'locale-changer',
  data () {
    return { langs: [] }
  },
   mounted() {
    this.importAll(require.context('../locales', true, /\.json$/));
  },
  methods: {
    importAll(r) {
      r.keys().forEach(key => (this.langs.push(key.slice(2,4))));
    },
    onChange(event) {
            console.log('language set to:' + event.target.value);
            wtconfig.set('general.language', event.target.value)
        }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
