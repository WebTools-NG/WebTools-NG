<template>
  <b-container class="m-2 mt-2">
    <div>   <!-- Title and desc -->
      <h2>
        {{ $t(`Modules.PlexTV.Name`) }}
      </h2>
      <h5>{{ $t(`Modules.PlexTV.Description`) }}</h5>
    </div>
    <b-link id="general" :to="{ path: '/settings/export', query: { return: 'plextv' } }">{{ $t("Modules.ET.Settings.Note") }} </b-link>
    <br>
    <div class="d-flex align-items-center">   <!-- Select User -->
      <b-form-group id="plexTVUsers" v-bind:label="$t('Modules.PlexTV.SelUsr')" label-size="lg" label-class="font-weight-bold pt-0">
        <div ref="libSpinner" id="libSpinner" :hidden="selUserWait">
          <b-spinner id="libLoad" class="ml-auto text-danger"></b-spinner>
        </div>
        <b-form-select
          v-model="selUser"
          id="selUser"
          :options="selUserOptions"
          style="width: Auto"
          name="selLibrary">
        </b-form-select>
        <WTNGtt tt="Modules.PlexTV.TT-User" size="20px"></WTNGtt>
      </b-form-group>
    </div>
    <b-input-group id="UserIDGrp" :prepend="$t('Modules.PlexTV.UsrID')" class="mt-3">
          <b-form-input id="usrID" name="usrID" type="text" class="form-control" v-model="usrID" :disabled=true></b-form-input>
    </b-input-group>
    <b-input-group id="UserNameGrp" :prepend="$t('Modules.PlexTV.UsrName')" class="mt-3">
          <b-form-input id="usrName" name="usrName" type="text" class="form-control" v-model="usrName" :disabled=true></b-form-input>
    </b-input-group>
    <b-input-group id="UserNameGrp" :prepend="$t('Modules.PlexTV.UsrFriendlyName')" class="mt-3">
          <b-form-input id="usrFriendlyName" name="usrFriendlyName" type="text" class="form-control" v-model="usrFriendlyName" :disabled=true></b-form-input>
    </b-input-group>
    <b-input-group id="UserEmailGrp" :prepend="$t('Modules.PlexTV.UsrEMail')" class="mt-3">
          <b-form-input id="usrEmail" name="usrEmail" type="text" class="form-control" v-model="usrEmail" :disabled=true></b-form-input>
    </b-input-group>
    <b-input-group id="UserRestrictedGrp" :prepend="$t('Modules.PlexTV.UsrRestricted')" class="mt-3">
          <b-form-input id="usrRestricted" name="usrRestricted"  class="form-control" v-model="usrRestricted" :disabled=true></b-form-input>
    </b-input-group>
    <b-input-group id="UserThumbGrp" :prepend="$t('Modules.PlexTV.UsrThumb')" class="mt-3">
          <b-form-input id="usrThumb" name="usrThumb" type="text" class="form-control" v-model="usrThumb" :disabled=true></b-form-input>
    </b-input-group>
    <b-input-group id="UserHomeGrp" :prepend="$t('Modules.PlexTV.UsrHome')" class="mt-3">
          <b-form-input id="usrHome" name="usrHome" class="form-control" v-model="usrHome" :disabled=true></b-form-input>
    </b-input-group>
    <b-input-group id="UserStatusGrp" :prepend="$t('Modules.PlexTV.UsrStatus')" class="mt-3">
          <b-form-input id="usrStatus" name="usrStatus" type="text" class="form-control" v-model="usrStatus" :disabled=true></b-form-input>
    </b-input-group>
    <br>
    <br>
    <div id="buttons" class="text-center"> <!-- Buttons -->
      <b-button-group>
          <b-button variant="success" class="mr-1" :disabled="this.selUser == ''" @click="exportUsr"> {{ $t('Modules.PlexTV.ExportUsr') }} </b-button>
          <b-button variant="success" class="mr-1"  @click="exportAllUsr">{{ $t('Modules.PlexTV.ExportAllUsr') }}</b-button>
      </b-button-group>
    </div>
  </b-container>
</template>

<script>
  import store from '../../../store';
  import { plextv } from "./scripts/plextv";
  import i18n from '../../../i18n';
  import { wtconfig } from '../General/wtutils';
  import WTNGtt from '../General/wtng-tt.vue'

  const log = require("electron-log");
  export default {
    components: {
            WTNGtt
        },
    data() {
      return {
        selUserWait: false,
        selUser: "",
        selUserOptions: [],
        selUserDetails: {},
        usrID: "",
        usrEmail: "",
        usrName: "",
        usrFriendlyName: "",
        usrRestricted: "",
        usrThumb: "",
        usrHome: "",
        usrStatus: ""
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
      this.selUserDetails = userLst[this.selUser];
      this.usrEmail = userLst[this.selUser]['email'];
      this.usrID = userLst[this.selUser]['id'];
      this.usrName = userLst[this.selUser]['title'];
      this.usrFriendlyName = userLst[this.selUser]['friendlyName'];
      this.usrRestricted = userLst[this.selUser]['restricted'].toString();
      this.usrThumb = userLst[this.selUser]['thumb'];
      this.usrHome = userLst[this.selUser]['home'].toString();
      this.usrStatus = userLst[this.selUser]['status'];
    }
  },
  methods: {
    exportUsr: async function(){
      if (wtconfig.get('General.ExportPath', "") == "")
      {
          log.info('ET: No output dir defined')
          this.$bvToast.toast(this.$t("Common.ErrorNoOutDirMsg"), {
          title: this.$t("Common.ErrorNoOutDirTitle"),
          autoHideDelay: 3000,
          solid: true,
          variant: 'primary',
          toaster: 'b-toaster-bottom-right'
          })
          return
      }
      log.info(`Export Plex.TV User: ${this.usrName}`);
      let Data = this.selUserDetails;
      const outFile = await plextv.exportUsr({Module: i18n.t("Modules.PlexTV.Name"), Usr: this.usrID, Data: Data});
      const bodyStr = i18n.t("Modules.PMS.ExportDoneBody", [outFile]);
        this.$bvToast.toast(bodyStr, {
          title: this.$t("Modules.PMS.ExportDoneTitle"),
          autoHideDelay: 400000,
          solid: true,
          variant: 'primary',
          toaster: 'b-toaster-bottom-right'
        });
    },
    exportAllUsr: async function(){
      if (wtconfig.get('General.ExportPath', "") == "")
      {
          log.info('ET: No output dir defined')
          this.$bvToast.toast(this.$t("Common.ErrorNoOutDirMsg"), {
          title: this.$t("Common.ErrorNoOutDirTitle"),
          autoHideDelay: 3000,
          solid: true,
          variant: 'primary',
          toaster: 'b-toaster-bottom-right'
          })
          return
      }
      log.info(`Export All Plex.TV Users`)
      let Data = this.$store.getters.getUsers;
      const outFile = await plextv.exportUsr({Module: i18n.t("Modules.PlexTV.Name"), Usr: 'All', Data: Data});
      const bodyStr = i18n.t("Modules.PMS.ExportDoneBody", [outFile]);
        this.$bvToast.toast(bodyStr, {
          title: this.$t("Modules.PMS.ExportDoneTitle"),
          autoHideDelay: 400000,
          solid: true,
          variant: 'primary',
          toaster: 'b-toaster-bottom-right'
        });
    },
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
