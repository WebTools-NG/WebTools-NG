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
        <button @click="up(scope.index, scope.row)" :disabled="queueStatus"><i class="fas fa-arrow-up"></i></button>
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
    <div id="buttons" class="text-center"> <!-- Buttons -->
      <b-button-group >
          <b-button
            class="mr-1"
            type="is-primary"
            @click="btnToggleQueue"
            variant="success"
          >
            {{ this.btnQueueLabel }}
          </b-button>
          <b-button
            class="mr-1"
            type="is-primary"
            @click="btnBackToDownload"
            variant="success"
          >
            {{ this.btnBackToDownloadLabel }}
          </b-button>
      </b-button-group>
    </div>
    <!--{{ download.queueRunning }}
    QueueStatus local: {{ queueRunning }}
    QueueStatus store: {{ queueStatus }}-->
    <br>
    <statusDiv /> <!-- Status Div -->
  </b-container>
</template>

<script>
  import i18n from '../../../../i18n';
  //import store from '../../../../store';
  import { wtconfig } from '../../General/wtutils';
  //import { pms } from '../../General/pms';
  import VueVirtualTable from 'vue-virtual-table';
  import { download } from '../scripts/Download.js';
  import statusDiv from '../../General/status.vue';

  const log = require("electron-log");
  export default {
    components: {
      VueVirtualTable,
      statusDiv
    },
    data() {
      return {
        tableConfig: [
          { prop: '_action', name: 'Action', actionName: 'actionCommon', width: 80  },
          { prop: 'title', name: i18n.t('Modules.Download.mediaInfo.title'), searchable: true,sortable: true, width: 80 },
          { prop: 'file', name: i18n.t('Modules.Download.mediaInfo.file'), searchable: false,sortable: true, width: 80 },
          { prop: 'type', name: i18n.t('Modules.Download.mediaInfo.type'), searchable: false,sortable: true, width: 30 },
          { prop: 'errorInfo', name: i18n.t('Modules.Download.mediaInfo.error'), searchable: false,sortable: true, width: 30 },
          { prop: 'hash', isHidden: true },
          { prop: 'key', isHidden: true },
          { prop: 'serverID', isHidden: true },
          { prop: 'serverName', isHidden: true },
          { prop: 'libName', isHidden: true },
          { prop: 'mediaDir', isHidden: true },
          { prop: 'size', isHidden: true },
          { prop: 'targetFile', isHidden: true },
          { prop: 'errors', isHidden: true },
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
        btnQueueLabel: i18n.t('Modules.Download.Queue.btnStartQueue'),
        btnBackToDownloadLabel: i18n.t('Modules.Download.Queue.btnBackToDownloadLabel')
      };
    },
    created() {
      log.info(`[Queue.vue] (created) - Download Queue Created`);
      this.GetQueue();
//      this.setCreatedStatus();
    },
    watch: {
      WatchQueue: async function(){
        this.GetQueue();
      },
      queueStatus:async function(){
        if (this.$store.getters.getQueueStatus){
          this.btnQueueLabel = i18n.t('Modules.Download.Queue.btnStopQueue');
        } else {
          this.btnQueueLabel = i18n.t('Modules.Download.Queue.btnStartQueue');
        }
      }
    },
    computed: {
      WatchQueue: function(){
        return this.$store.getters.getQueue
      },
      queueStatus: function(){
        return this.$store.getters.getQueueStatus
      }

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
      btnBackToDownload(){
        this.$router.push({ name: 'download' })
      },
      btnToggleQueue(){
        if ( download.queueRunning ){
          download.stopProcess();
          this.btnQueueLabel = i18n.t('Modules.Download.Queue.btnStartQueue');
        }
        else {
          //this.startQueue();
          download.startProcess();
          this.btnQueueLabel = i18n.t('Modules.Download.Queue.btnStopQueue');
        }
      },
      info(index, row){
        this.mediaInfo.mediaInfoTitle = `${i18n.t("Modules.Download.mediaInfo.title")}: ${row['title']} - ${row['type']}`
        this.mediaInfoItems = [];
        this.mediaInfoItems.push({ " ": `${ i18n.t("Modules.Download.mediaInfo.file") } : ${row['file']}` });
        if ( row['size'] ){
          this.mediaInfoItems.push({ " ": `${ i18n.t("Modules.Download.mediaInfo.size") } : ${row['size']} (${download.formatBytes(row['size'])})` });
        }
        this.mediaInfoItems.push({ " ": `${ i18n.t("Modules.Download.mediaInfo.serverName") } : ${row['serverName']} (id: ${row['serverID']})` });
        this.mediaInfoItems.push({ " ": `${ i18n.t("Modules.Download.mediaInfo.libName") } : ${row['libName']}` });
        this.mediaInfoItems.push({ " ": `${ i18n.t("Modules.Download.mediaInfo.sourceUri") } : ${row['key']}` });
        this.mediaInfoItems.push({ " ": `${ i18n.t("Modules.Download.mediaInfo.targetFile") } : ${row['targetFile'].slice(0, -4)}` });
        let errors = "";
        for(var attributename in row['error']){
          errors = errors + attributename+": "+row['error'][attributename] + '\r\n';
          console.log(attributename+": "+row['error'][attributename]);
        }
        //errors
        this.mediaInfoItems.push({ " ": `${ i18n.t("Modules.Download.mediaInfo.errors") } : ${errors}` });
        this.$refs['MediaInfo'].show();
      },
      del(index, row){
        log.info(`[Queue.vue] (del) - Delete index: ${index} with contents: ${ JSON.stringify(row) }`);
        this.tableData.splice(index, 1);
        wtconfig.set('Download.Queue', this.tableData);
      },
      GetQueue(){
        log.info(`[Queue.vue] (GetQueue) - Get the queue`);
        let queueData = wtconfig.get('Download.Queue');
        const DownloadMaxErrors = wtconfig.get("Download.DownloadMaxErrors", 5);
        for (var idx in queueData){
          if(queueData[idx]['error']){
            var count = Object.keys(queueData[idx]['error']).length;
            if (count > DownloadMaxErrors){
              queueData[idx]['errorInfo'] = i18n.t('Modules.Download.Queue.ErrorsAboveLimit');
            } else {
              queueData[idx]['errorInfo'] = i18n.t('Common.Ok');
            }
          } else {
            queueData[idx]['errorInfo'] = i18n.t('Common.Ok');
          }
        }
        this.tableData = queueData;
      }
    }
  }


</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>



</style>
