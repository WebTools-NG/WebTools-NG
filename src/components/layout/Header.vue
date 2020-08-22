<template>


<div>
  <b-navbar toggleable="lg" type="dark" variant="dark">
    <b-navbar-brand>
      <img src="https://placekitten.com/g/48/48" class="d-inline-block align-top" alt="Kitten">
    </b-navbar-brand>

    <b-navbar-brand>
        {{ $t("Common.AppName") }}
    </b-navbar-brand>

    <b-navbar-nav class="ml-auto">
         <b-nav-form>
          <b-form-select v-model="selectedOption" :options="pserver"  size="sm" class="mr-sm-2" placeholder="servers"></b-form-select >
          <b-button size="sm" class="my-2 my-sm-0" type="submit">Reload</b-button>
        </b-nav-form>
    </b-navbar-nav>

      <b-navbar-nav class="ml-auto">
        <b-nav-text >Navbar text</b-nav-text>

        <img src="https://placekitten.com/g/48/48" class="d-inline-block align-top" alt="Kitten">
      </b-navbar-nav>
  </b-navbar>
</div>





<!-- 
<section class="hero is-dark is-small">
<div class="hero-body">
        <div class="level">
            <div class="level-right">
            <div class="level-item">
                    <figure class="image is-48x48">
                        <img src="@/assets/WebTools.png">
                    </figure>
                    <div id="title" >
                        <p id="top_title" class="title is-size-3">{{ $t("Common.AppName") }}</p>
                    </div>
            </div>
             </div>
                <div class="level-item">
                    <div class="select is-dark">                       
                        <b-select v-bind:placeholder="$t('Common.SelServer')"
                            v-model="selectedOption"
                            @input="selected">
                            <option
                                v-for="option in pserver"
                                :value="option"
                                :key="option.clientIdentifier">
                                {{ option.name }}
                            </option>
                        </b-select>
                    </div>
                    <b-button id="sync-button" @click="fetchServers" type="is-warning" 
                        icon-left="fas fa-sync" icon-pack="fas" class="is-pulled-right" >
                    </b-button>
                </div>
                <div class="level-left">
            <div class="level-item">
                    <p id="plexname">{{ getPlexName() }}</p>
                    <figure class="image is-48x48" id="avatar">
                        <img id="avatar" :src="getAvatar()">
                    </figure>
                </div>
                </div>

            </div>
        </div>
</section> -->

</template>

<script>
import store from '../../store';
import { ptv } from '../modules/General/plextv';
const log = require('electron-log');

export default {
    data(){
        return {
            selectedOption: []
        }
    },
    methods: {
        fetchServers(){
            log.info("fetching servers")
            this.$store.dispatch('fetchPlexServers', store.getters.getAuthToken);
        },
        active2(e) {
            log.info("active2 called")
            this.active = e;
        },
        selected: function () {
            log.info('HEADER: selected server: ' + this.selectedOption.name)
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
        }
    },
    created(){
        log.info("menu created")
        this.$store.dispatch('fetchPlexServers');
    },
    computed: {
        pserver(){
        return this.$store.getters.getPlexServers
        }
    }
}
</script>

<style scoped>

</style>