<template>
  <section class="section">
    <h1 class="title is-3">{{ $t("Modules.ET.Name") }}</h1>    
    <h2 class="subtitle">{{ $t("Modules.ET.Description") }}</h2>
    <br>
    <h1 class="title is-3">1. Select lib</h1>
    <div class="select is-dark">

    <b-select v-bind:placeholder="$t('Modules.ET.SelectSelection')"                        
      @input="selectSelection">
        <option
          v-for="option in pmsSections"
          :value="option"
          :key="option.key"
          v-on:change="onchange()">
          {{ option.title }}
        </option>
    </b-select>
    </div>

  </section>
</template>

<script>
export default {
  name: 'export',
  created(){
    console.log("ET Created")
    this.$store.dispatch('fetchSections');
  }, computed: {
      pmsSections(){
        return this.$store.getters.getPmsSections
      }
  }, methods: {
        selectSelection: function (selected) {
          console.log(selected)
          //this.$store.commit("UPDATE_SELECTED_SERVER", selected);
        },
  }
  
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
