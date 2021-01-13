<template>    
    <div class="col-lg-10 col-md-12 col-xs-12">
      <h3>{{ $t("Modules.PlexTV.Name") }} <br>      
      </h3>    
      {{ $t("Modules.PlexTV.Description") }}

      <br>
      <br>
      <!-- Select User -->
      <div class="d-flex align-items-center">
        <b-form-group id="plexTVUsers" v-bind:label="$t('Modules.PlexTV.SelUsr')" label-size="lg" label-class="font-weight-bold pt-0">        
          <div ref="libSpinner" id="libSpinner" :hidden="selUserWait">
            <b-spinner id="libLoad" class="ml-auto text-danger"></b-spinner>
          </div>
          <b-tooltip target="plexTVUsers" triggers="hover">
            {{ $t('Modules.PlexTV.TT-User') }}
          </b-tooltip>
          <b-form-select 
            v-model="selUser"          
            id="selUser"
            :options="selUserOptions"
            name="selLibrary">        
          </b-form-select>
        </b-form-group>      
      </div> 
    </div>                        
</template>

<script>  
 // import i18n from '../../../i18n';
  import store from '../../../store';
  //import { wtconfig } from '../General/wtutils';

 // i18n

  
  
  const log = require("electron-log");
  export default {
      data() {
        return {
          selUserWait: false,          
          selUser: "",
          selUserOptions: []                              
        };
  },  
  async created() {
    log.info("PlexTV Created");
    // Get users from plex.tv    
    await store.dispatch('fetchUsers');
    this.getUsers();    
  },
  watch: {
    // Watch for when selecting a user
    selUser: async function(){
      // Changed, so we need to update the libraries
      var userLst = this.$store.getters.getUsers;
      log.verbose(`Watch detected a user was selected as ${JSON.stringify(userLst[this.selUser])}`);           


    }
  },
  methods: {
    getUsers: async function(){
      this.selUserWait = false;
      var userLst = this.$store.getters.getUsers;      
      // Output store
      const result = [];
      // Temp Store, in order to sort the list, case insensitive
      const unSortedUsr = [];
      for(var itemNo in userLst){
        unSortedUsr.push(userLst[itemNo]['title'].toLowerCase() + '-:-' +userLst[itemNo]['title'] + '-:-' + itemNo)
      }
      // Add user,id to Output store
      for(var key in unSortedUsr.sort()){
        let item = [];
        item['text']=unSortedUsr[key].split("-:-")[1];
        item['value']=unSortedUsr[key].split("-:-")[2];
        result.push(Object.assign({}, item));
      }
      this.selUserOptions = result;
      this.selUserWait = true;      
    }
  }

};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
#sync-button {
  margin-left: 1em;
}
</style>
