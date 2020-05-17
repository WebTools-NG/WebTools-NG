<template>
  <section class="section">
    <h1 class="title is-2">{{ $t("Language.Name") }}</h1>    
    <h2 class="subtitle">{{ $t("Language.Description") }}</h2>
    <br>
    <div class="control has-icons-left">
    <div class="locale-changer select is-dark is-medium" >
      <select v-model="$i18n.locale">
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
}
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
