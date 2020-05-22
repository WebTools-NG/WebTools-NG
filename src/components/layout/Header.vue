<template>
<section class="hero is-dark is-small">
<div class="hero-body">
        <div class="columns is-vcentered">
            
            
                <figure class="image is-48x48 is-pulled-left">
                <img src="https://bulma.io/images/placeholders/128x128.png">
                </figure>

<!--                 <div id="title" >
                <p id="top_title" class="title is-size-3 is-pulled-left">{{ $t("Common.AppName") }}</p>
                </div> -->

                <div id="title" >
                <p id="top_title" class="title is-size-3">{{ $t("Common.AppName") }}</p>
                </div>

             <div class="container is-vcentered is-pulled-right">
                <div class="select is-dark is-pulled-right">
                <b-select placeholder="Select Server"
                @input="assignTag">
                <option
                    v-for="option in pserver"
                    :value="option.clientIdentifier"
                    :key="option.clientIdentifier"
                    v-on:change="onchange()"
                    >
                    {{ option.name }}
                </option>
            </b-select>
                </div>
                 
                <b-button  id="sync-button" @click="fetchServers" type="is-warning" 
                icon-left="fas fa-sync" icon-pack="fas" class="is-pulled-right" >
                </b-button>

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
            this.$store.dispatch('getPlexServers', store.getters.getAuthToken);
        },
        assignTag: function (selected) {
            this.selected = selected;
            this.$store.commit("UPDATE_SELECTED_SERVER", selected);
        },
        onChange(event) {
              console.log(event.target.selected);
          }
    },
    created(){
        console.log("menu created")
        this.$store.dispatch('getPlexServers');
    },
    computed: {
        pserver(){
        return this.$store.getters.plexServers
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