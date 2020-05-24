<template>
<section class="hero is-dark is-small">
<div class="hero-body">
        <div class="level">

            <div class="level-left">
                <div class="level-item">
                    <figure class="image is-48x48">
                        <img src="@/assets/WebTools.png">
                    </figure>
                    <div id="title" >
                        <p id="top_title" class="title is-size-3">{{ $t("Common.AppName") }}</p>
                    </div>
                </div>
            </div>

            <div class="level-right">
                <div class="level-item">
                    <figure class="image is-48x48" id="avatar">
                        <img id="avatar" :src="getAvatar()">
                    </figure>
                </div>

                <div class="level-item">
                    <b-button   id="sync-button" @click="fetchServers" type="is-warning" 
                                icon-left="fas fa-sync" icon-pack="fas" class="is-pulled-right" >
                    </b-button>

                    <div class="select is-dark">
                        <b-select v-bind:placeholder="$t('Common.SelServer')"                        
                            @input="assignTag">
                            <option
                                v-for="option in pserver"
                                :value="option.clientIdentifier"
                                :key="option.clientIdentifier"
                                v-on:change="onchange()">
                                {{ option.name }}
                            </option>
                        </b-select>
                    </div>
                </div>
            </div>
        </div>
</div>
</section>
</template>

<script>
import store from '../../store';



export default {
    methods: {
        fetchServers(){
            console.log("fetching servers")
            this.$store.dispatch('fetchPlexServers', store.getters.getAuthToken);
        },
        assignTag: function (selected) {
            this.selected = selected;
            this.$store.commit("UPDATE_SELECTED_SERVER", selected);
        },
        onChange(event) {
              console.log(event.target.selected);
          },
          getAvatar(){
                return this.$store.getters.getAvatar
           }
    },
    created(){
        console.log("menu created")
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
    #title {
        margin-left: 15px;
    }
    #sync-button{
        margin-right: 10px;
    }
</style>