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
          :value="option.key"
          :key="option.key"
          v-on:change="onchange()">
          {{ option.title }}
        </option>
    </b-select>
    </div>
    <br>
    <hr>

    <h1 class="title is-3">2. Get data</h1>
    <div class="buttons">
      <b-button type="is-primary" @click="getMedia" icon-left="fas fa-file-download" icon-pack="fas">Get Media from selection</b-button>
    </div>
    <hr>
    <h1 class="title is-3">3. Get data</h1>


  </section>
</template>

<script>
export default {
  name: 'export',
  created(){
    console.log("ET Created")
    this.$store.dispatch('fetchSections');
  }, computed: {
      pmsSections: function(){
        
        return this.$store.getters.getPmsSections
      }
  }, methods: {
        selectSelection: function (selected) {
          console.log(selected)
          this.$store.commit("UPDATE_SELECTEDSECTION", selected);
        },
        getMedia(){
          console.log("getMedia Called")
              this.$store.dispatch('getMedia');
        }
  }
  
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
