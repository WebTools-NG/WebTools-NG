<template>
<div>
  <b-navbar toggleable="lg" type="dark" variant="dark">
    <b-navbar-brand href="#">
      <img src="@/assets/WebTools-32.png"  class="d-inline-block align-top" alt="Kitten">
        {{ $t("Common.AppName") }}
    </b-navbar-brand>
    <b-navbar-nav class="ml-auto mr-2">
        <b-nav-form>
            <b-form-select  v-model="selectedOption" @input="selected" size="sm" class="mr-sm-2">
                <option
                    v-for="option in pmsServers"
                    :value="option"
                    :key="option.clientIdentifier">
                    {{ option.name }}
                </option>
            </b-form-select >
            <b-button size="sm" class="my-2 my-sm-0" @click="fetchServers" variant="warning">
                <b-icon icon="arrow-clockwise" aria-hidden="true"></b-icon> {{ $t("Common.Reload") }}
          </b-button>
        </b-nav-form>
    </b-navbar-nav>

        <b-navbar-nav class="ml-auto mr-2">
                <b-img :src="getAvatar()" rounded="circle" alt="Circle image" width="32" height="32" class="m1"></b-img>
        </b-navbar-nav>


  </b-navbar>
</div>

</template>

<script>
import store from '../../store';
import { ptv } from '../modules/General/plextv';
import { wtconfig } from '../modules/General/wtutils';
const log = require('electron-log');
console.log = log.log;

export default {
    data(){
        return {
            selectedOption: [],
            pmsServers: []
        }
    },
    methods: {
        fetchServers(){
            log.info("[Headers.vue] (fetchServers) fetching servers")
            this.$store.dispatch('fetchPlexServers', store.getters.getAuthToken);
        },
        selected: function () {
            log.info(`[Headers.vue] (selected) Selected server: ${this.selectedOption.name}`)
            ptv.checkServerConnect(this.selectedOption)
            this.$store.commit("UPDATE_SELECTED_SERVER", this.selectedOption);
        },
        onChange(event) {
              log.info(event.target.selected);
          },
        getAvatar(){
            return this.$store.getters.getAvatar
        },
        getPlexName(){
            return this.$store.getters.getPlexName
        },
        async getValidPMSSrv() {
            log.info("[Headers.vue] (getValidPMSSrv) fetching servers");
            // Fetch all servers from plex.tv
            await ptv.fetchPMSServers();
            // Filter result
            const result = await ptv.getPMSServers( wtconfig.get("Developer.showNotOwned", false) );
            this.pmsServers = result;
        }
    },
    created(){
        log.info("[Header.vue] (created) menu created");
        this.getValidPMSSrv();
    }
}
</script>

<style scoped>

</style>