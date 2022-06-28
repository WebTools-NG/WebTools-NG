<template>
  <b-container fluid>
    <div class="col-lg-10 col-md-12 col-xs-12">
        <h1>{{ $t("Common.Settings.LibMapping.Name") }}</h1>
        <p>{{ $t("Common.Settings.LibMapping.Description") }}</p>
    </div>
    <br>
    <!-- Select Lib -->
    <div class="d-flex align-items-center">
      <b-form-group id="SelLibGroup" v-bind:label="$t('Modules.ET.optExpType.lblSelectSelection')" label-size="lg" label-class="font-weight-bold pt-0">
        <b-tooltip target="SelLibGroup" triggers="hover">
          {{ $t('Common.Settings.LibMapping.ttSelectLibrary') }}
        </b-tooltip>
        <b-form-select
          v-model="selLib"
          id="selLib"
          :options="selLibOptions"
          @change="getLibPath"
          name="selLib">
        </b-form-select>
      </b-form-group>
    </div>
    <br>
    <!-- Table of section path -->
    <b-table ref="table"
      striped
      hover
      :items="items"
      @row-clicked="pathRowClickHandler"
      >
    </b-table>
    <br>
    <!-- Buttons -->
    <div class="buttons">
        <!-- Buttons -->
        <div id="buttons" class="text-center">
            <b-button-group >
                <b-button variant="success" class="mr-1" @click="jumpToSettings"> {{ $t('Common.Settings.Return') }} </b-button>
            </b-button-group>
        </div>
    </div>

  </b-container>
</template>

<script>
  import i18n from '../../../../i18n';
  import store from '../../../../store';
  import { wtconfig, dialog } from '../../General/wtutils';
  import { pms } from '../../General/pms';

  const log = require("electron-log");
  export default {
      data() {
        return {
          serverIsSelected: false,
          selLibOptions: [],
          selLib: "",
          selLibraryWait: true,
          items: []
        };
    },
    created() {
      log.info("LibraryMapping Created");
      this.serverSelected();
      this.getPMSSections();
    },
    watch: {
      // Watch for when selected server address is updated
      selectedServerAddress: async function(){
        // Changed, so we need to update the libraries
        this.selLibraryWait = true;
        await this.getPMSSections();
        this.selLibraryWait = true;
      }
    },
    computed: {
      // We need this computed, for watching for changes to selected server
      selectedServerAddress: function(){
        return this.$store.getters.getSelectedServerAddress
      }
    },
    methods: {
      // Return to main Settings
      jumpToSettings(){
          this.$router.push({ name: 'settingsGlobal' })
      },
      // Update mapped path
      pathRowClickHandler: async function( record, index ){
        log.debug(`[LibraryMapping.vue] (pathRowClickHandler) - Start to browse for directory`);
        log.debug(`[LibraryMapping.vue] (pathRowClickHandler) - Defined path is ${JSON.stringify(record)} with an index of: ${index}`);
        const mapDir = dialog.OpenDirectory( i18n.t("Common.Settings.LibMapping.SelectMapDirPath"), i18n.t("Common.Ok"));
        if (mapDir)
        {
          let curVal = {};
          curVal['PMS'] = this.items[index]['PMS'];
          // If a dot is present in the path, we need to escape it
          curVal['PMS'] = curVal['PMS'].replace('.', '\\.');
          curVal['Workstation'] = mapDir[0];
          curVal['_rowVariant'] = "success";
          // Get ServerID
          const serverID = store.getters.getSelectedServer.clientIdentifier;
          // Save setting
          wtconfig.set(`PMS.LibMapping.${serverID}.${curVal['PMS']}`, curVal['Workstation']);
          // Remove escape char for viewing
          curVal['PMS'] = curVal['PMS'].replace('\\.', '.');
          this.items[index] = curVal;
          // Update view
          this.$refs.table.refresh();
        }
      },
      getPMSSections: async function(){
        this.selLibrary = "";
        this.selLibOptions = await pms.getPMSSections(['movie', 'show']);
      },
      /* Check if a server is selected, and if not
      tell user, and disable backup */
      async serverSelected() {
        let serverCheck = this.$store.getters.getSelectedServer;
        this.serverIsSelected = ( this.$store.getters.getSelectedServer != "none" );
        if (serverCheck == "none") {
          log.debug("[LibraryMapping.vue] (serverSelected) - serverCheck is none");
          this.$bvToast.toast(this.$t("Modules.PMS.ErrorNoServerSelectedMsg"), {
            title: this.$t("Modules.PMS.ErrorNoServerSelectedTitle"),
            autoHideDelay: 4000,
            solid: true,
            variant: 'primary',
            toaster: 'b-toaster-bottom-right'
          });
        }
      },
      /* Present user with both PMS path, as well as defined mappings */
      getLibPath: async function(){
        let arrPath = [];
        const serverID = store.getters.getSelectedServer.clientIdentifier;
        log.info(`[LibraryMapping.vue] (getLibPath) ServerID is: ${serverID}`);
        const fs = require("fs");
        arguments[0]['location'].forEach(element => {
          let entry, virtualElement;
          virtualElement = element.replace('.', '\\.');
          const wkstnPath = wtconfig.get(`PMS.LibMapping.${serverID}.${virtualElement}`, this.$t("Common.Settings.LibMapping.ClickToDefine"));
          log.info(`[LibraryMapping.vue] (getLibPath) Saved path is: ${wkstnPath}`);
          // Check if path exists
          if (fs.existsSync(wkstnPath)) {
            log.debug(`[LibraryMapping.vue] (getLibPath) Saved path existed`);
            entry = {PMS: element, Workstation: wkstnPath, _rowVariant: 'success'};
          } else {
            log.debug(`[LibraryMapping.vue] (getLibPath) Saved path not defined`);
             if (fs.existsSync(element)) {
               log.debug(`[LibraryMapping.vue] (getLibPath) PMS path existed`);
               wtconfig.set(`PMS.LibMapping.${serverID}.${element}`, element);
               entry = {PMS: element, Workstation: element, _rowVariant: 'success'};
             }
             else {
               log.error(`[LibraryMapping.vue] (getLibPath) PMS path unknown`);
               entry = {PMS: element, Workstation: wkstnPath, _rowVariant: 'danger'};
             }
          }
          arrPath.push(entry);
        });
        this.items = arrPath;
      }
    }
  }


</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
#sync-button {
  margin-left: 1em;
}
</style>
