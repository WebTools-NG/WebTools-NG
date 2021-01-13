<template>
  <b-container fluid>
    <div class="col-lg-9 col-md-12 col-xs-12">

    <h2>{{ $t("Modules.About.Name") }}</h2>    
    <h3>{{ $t("Modules.About.MainDevelopers") }}</h3>
    <p>{{ $t("Modules.About.Devdane22") }}</p>
    <p>{{ $t("Modules.About.DevCPSO") }}</p>
    <br>
    <h3>{{ $t("Modules.About.WikiDevelopers") }}</h3>
    <p>{{ $t("Modules.About.Wikitrumpy81") }}</p>
    <h3>
      {{ $t("Modules.About.TranslationBetaTestersTitle") }} <br>
      <small>{{ $t("Modules.About.TranslationBetaTestersText") }}</small>
    </h3>
    <div>
      <ul class="list-inline">
          <li class="list-inline-item" v-for="(po, index) in poTranslators" :key="po.name">{{ po.name }}<span v-if="index != (poTranslators.length - 1)">,</span></li>
      </ul>
    </div>
    <br>
    <h6>{{ $t("Modules.About.PlexPoCredits") }}</h6>
    </div>
  </b-container>
</template>

<script>
export default {
  name: 'about',
  methods: {
  }, 
  async created() {
    await this.$store.dispatch('fetchPOEContrib');
  },
  computed: {
    poTranslators(){
      return this.$store.getters.getContrib
    }
  }
}

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
