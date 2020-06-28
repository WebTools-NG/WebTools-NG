<template>
  <section class="section">
    <h1 class="title is-3">{{ $t("Modules.About.Name") }}</h1>    
    <h1 class="title is-3">{{ $t("Modules.About.MainDevelopers") }}</h1>
    <p>{{ $t("Modules.About.Devdane22") }}</p>
    <p>{{ $t("Modules.About.DevCPSO") }}</p>
    <br>
    <h1 class="title is-3">{{ $t("Modules.About.TranslationBetaTestersTitle") }}</h1>
    <h2 class="subtitle">{{ $t("Modules.About.TranslationBetaTestersText") }}</h2>
    <br>
    <h1 class="title is-5">{{ $t("Modules.About.PlexPoCredits") }}</h1>

    <div class="container">
  <div class="notification">
    {{ poTranslators }}
  </div>
</div>




    



  </section>
</template>

<script>
export default {
  name: 'about',
  methods: {
  }, created() {
  this.$store.dispatch('fetchPOEContrib');
  this.$store.getters.poTranslators
  }, computed: {
    poTranslators(){
      console.log(this.$store.getters.poTranslators)
      console.log('computed:contrip'+this.$store.getters.getContrip)
      return this.$store.getters.getContrip
    }
  }
}

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
