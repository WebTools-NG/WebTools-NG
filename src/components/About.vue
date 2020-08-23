<template>
  <b-container fluid>
    <div class="col-lg-9 col-md-12 col-xs-12">

    <h1>{{ $t("Modules.About.Name") }}</h1>    
    <h2>{{ $t("Modules.About.MainDevelopers") }}</h2>
    <p>{{ $t("Modules.About.Devdane22") }}</p>
    <p>{{ $t("Modules.About.DevCPSO") }}</p>
    <br>
    <h2>
      {{ $t("Modules.About.TranslationBetaTestersTitle") }} <br>
      <small>{{ $t("Modules.About.TranslationBetaTestersText") }}</small>
    </h2>
    <div>
      <ul class="list-inline">
          <li class="list-inline-item" v-for="po in poTranslators" :key="po.name">{{ po.name }}</li>
      </ul>
    </div>
    <br>
    <h5>{{ $t("Modules.About.PlexPoCredits") }}</h5>
    </div>
  </b-container>
</template>

<script>
export default {
  name: 'about',
  methods: {
  }, created() {
  this.$store.dispatch('fetchPOEContrib');
  
  }, computed: {
    poTranslators(){
     return this.$store.getters.getContrib
    }
  }
}

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
