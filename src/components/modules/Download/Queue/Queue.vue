<template>
  <b-container class="m-2 mt-2">
    <div>   <!-- Title and desc -->
      <h2>
        {{ $t(`Modules.Download.Queue.Name`) }}
      </h2>
      <h5>{{ $t(`Modules.Download.Queue.Description`) }}</h5>
    </div>
    <br>
    <!-- Queue Table -->
    <vue-virtual-table
     :config="tableConfig"
     :data="tableData"
     :bordered="tableAttribute.bordered"
     :minWidth="tableAttribute.minWidth"
     :language="tableAttribute.language"
     :selectable="tableAttribute.selectable"
     :itemHeight="tableAttribute.itemHeight">
      <template slot-scope="scope" slot="actionCommon">
        <button @click="up(scope.index, scope.row)" :disabled="queueRunning"><i class="fas fa-arrow-up"></i></button>
        <button @click="down(scope.index, scope.row)" :disabled="queueRunning"><i class="fas fa-arrow-down"></i></button>
        <button @click="del(scope.index, scope.row)" :disabled="queueRunning"><i class="fas fa-trash"></i></button>
        <button @click="info(scope.index, scope.row)"><i class="fas fa-info"></i></button>
      </template>
    </vue-virtual-table>
    <!-- Media Info -->
    <b-modal size="lg" ref="MediaInfo" hide-footer v-bind:title=this.mediaInfo.mediaInfoTitle>
      <div>
        <b-table striped :items="mediaInfoItems"></b-table>
      </div>
    </b-modal>
    <br>
    <div class="d-flex mx-auto">  <!-- Buttons -->
      <div class="buttons d-flex mx-auto">
        <b-button
          type="is-primary"
          @click="btnToggleQueue"
          variant="success"
        >
        {{ this.btnQueueLabel }}</b-button>
      </div>
    </div>
    {{ this.queueRunning }}
  </b-container>
</template>

<script>
  import i18n from '../../../../i18n';
  //import store from '../../../../store';
  import { wtconfig } from '../../General/wtutils';
  //import { pms } from '../../General/pms';
  import VueVirtualTable from 'vue-virtual-table';
  import { download } from '../scripts/Download.js';

  

  const log = require("electron-log");
  export default {
    components: {
      VueVirtualTable
    },
    data() {
      return {
        tableConfig: [
          { prop: '_action', name: 'Action', actionName: 'actionCommon', width: 80  },
          { prop: 'title', name: i18n.t('Modules.Download.mediaInfo.title'), searchable: true,sortable: true, width: 80 },
          { prop: 'file', name: i18n.t('Modules.Download.mediaInfo.file'), searchable: true,sortable: true, width: 80 },
          { prop: 'type', name: i18n.t('Modules.Download.mediaInfo.type'), searchable: true,sortable: true, width: 30 },
          { prop: 'status', name: i18n.t('Modules.Download.mediaInfo.status'), searchable: true,sortable: true, width: 30 },
          { prop: 'hash', isHidden: true },
          { prop: 'key', isHidden: true },
          { prop: 'serverID', isHidden: true },
          { prop: 'serverName', isHidden: true },
          { prop: 'libName', isHidden: true },
          { prop: 'mediaDir', isHidden: true },
          { prop: 'size', isHidden: true },
          { prop: 'targetFile', isHidden: true }
        ],
        tableData: [],
        tableAttribute: {
          height: 1000,
          itemHeight: 50,
          minWidth: 10,
          selectable: false,
          enableExport: false,
          bordered: true,
          hoverHighlight: true,
          language: "en"
        },
        mediaInfo: {
          mediaInfoTitle: ""
        },
        mediaInfoItems: [],
        queueRunning: null,
        btnQueueLabel: i18n.t('Modules.Download.Queue.btnStartQueue')
      };
    },
    created() {
      log.info(`[Queue.vue] (created) - Download Queue Created`);
      this.GetQueue();
      this.setCreatedStatus();
    },
    watch: {
    },
    computed: {
    },
    methods: {
      up( index ){
        if ( index > 0 ){
          // Move one up
          this.tableData.splice(index - 1, 0, this.tableData.splice(index, 1)[0]);
          // Save to json
          wtconfig.set('Download.Queue', this.tableData);
        }
      },
      down( index ){
        if ( index < this.tableData.length){
          // Move one down
          this.tableData.splice(index + 1, 0, this.tableData.splice(index, 1)[0]);
          // Save to json
          wtconfig.set('Download.Queue', this.tableData);
        }
      },
      setCreatedStatus(){
        this.queueRunning = wtconfig.get( 'Download.Status', false);
      },
      btnToggleQueue(){
        if ( this.queueRunning ){
          this.stopQueue();
          this.btnQueueLabel = i18n.t('Modules.Download.Queue.btnStartQueue');
        }
        else {
          this.startQueue();
          this.btnQueueLabel = i18n.t('Modules.Download.Queue.btnStopQueue');
        }
        wtconfig.set('Download.Status', this.queueRunning);
      },
      stopQueue(){
        this.queueRunning = false;
        console.log('Ged 43-3 Queue stopped')
      },
      startQueue(){
        this.queueRunning = true;
        download.startProcess();
        console.log('Ged 44-3 Queue started')


      },
      info(index, row){
        this.mediaInfo.mediaInfoTitle = `${i18n.t("Modules.Download.mediaInfo.mediaInfoTitle")}: ${row['title']} - ${row['type']}`
        this.mediaInfoItems = [];
        this.mediaInfoItems.push({ " ": `${ i18n.t("Modules.Download.mediaInfo.title") }: ${row['title']}` });
        this.mediaInfoItems.push({ " ": `${ i18n.t("Modules.Download.mediaInfo.file") } : ${row['file']}` });
        if ( row['size'] ){
          this.mediaInfoItems.push({ " ": `${ i18n.t("Modules.Download.mediaInfo.size") } : ${row['size']}` });
        }
        this.mediaInfoItems.push({ " ": `${ i18n.t("Modules.Download.mediaInfo.serverID") } : ${row['serverID']}` });
        this.mediaInfoItems.push({ " ": `${ i18n.t("Modules.Download.mediaInfo.serverName") } : ${row['serverName']}` });
        this.mediaInfoItems.push({ " ": `${ i18n.t("Modules.Download.mediaInfo.libName") } : ${row['libName']}` });
        this.mediaInfoItems.push({ " ": `${ i18n.t("Modules.Download.mediaInfo.sourceUri") } : ${row['key']}` });
        this.mediaInfoItems.push({ " ": `${ i18n.t("Modules.Download.mediaInfo.targetDir") } : ${row['mediaDir']}` });
        this.mediaInfoItems.push({ " ": `${ i18n.t("Modules.Download.mediaInfo.targetFile") } : ${row['targetFile']}` });
        this.$refs['MediaInfo'].show();
      },
      del(index, row){
        log.info(`[Queue.vue] (del) - Delete index: ${index} with contents: ${ JSON.stringify(row) }`);
        this.tableData.splice(index, 1);
        wtconfig.set('Download.Queue', this.tableData);
      },
      GetQueue(){
        log.info(`[Queue.vue] (GetQueue) - Get the queue`);
        this.tableData = wtconfig.get('Download.Queue');
      }
    }
  }


</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
