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
                <select>
                    <option>Select dropdown</option>
                    <option>With options</option>
                    <option>Loooooooong server name</option>

                </select>
                </div>
                 
                <b-button  id="sync-button" @click="clickMe" type="is-warning" icon-left="fas fa-sync" icon-pack="fas" class="is-pulled-right" >
                </b-button>

                </div>
        </div>
</div>
</section>
</template>

<script>


export default {

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