<template>
  <b-container class="m-2 mt-2">
    <div>   <!-- Title and desc -->
      <h2>
        {{ $t(`Modules.About.Name`) }}
      </h2>
      <h5>{{ $t(`Modules.About.MainDevelopers`) }}</h5>
      <p>{{ $t("Modules.About.Devdane22") }}</p>
      <p>{{ $t("Modules.About.DevCPSO") }}</p>
      <br>
      <h5>{{ $t("Modules.About.WikiDevelopers") }}</h5>
      <p>{{ $t("Modules.About.Wikitrumpy81") }}</p>
      <br>
      <h5>
        {{ $t("Modules.About.TranslationBetaTestersTitle") }} <br>
        <small>{{ $t("Modules.About.TranslationBetaTestersText") }}</small>
      </h5>
      <div>
        <ul class="list-inline">
            <li class="list-inline-item" v-for="(po, index) in poeTranslators" :key="po.name">{{ po.name }}<span v-if="index != (poeTranslators.length - 1)">,</span></li>
        </ul>
      </div>
      <br>
      <p>{{ $t("Modules.About.PlexPoCredits") }}</p>
    </div>
  </b-container>
</template>

<script>
const log = require('electron-log');
console.log = log.log;
export default {
  data() {
    return {
      poeTranslators: []
    }
  },
  async created() {
    await this.$store.dispatch('fetchPOEContrib');
    this.poeTranslators = await this.$store.getters.getContrib;
  },
  mounted() {
    log.info(`[About.vue] (mounted) - About Created`);
  }
}

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
