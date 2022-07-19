<template>
  <b-container class="m-2 mt-2">
    <div>   <!-- Title and desc -->
      <h2>
        {{ $t(`Modules.Download.Queue.Name`) }}
      </h2>
      <h5>{{ $t(`Modules.Download.Queue.Description`) }}</h5>
    </div>
    <br>
    <vue-virtual-table
     @click="rowClicked"
     :key="idx"
     :config="tableConfig"
     :data="tableData"
     :bordered="tableAttribute.bordered"
     :minWidth="tableAttribute.minWidth"
     :language="tableAttribute.language"
     :selectable="tableAttribute.selectable"
     :itemHeight="tableAttribute.itemHeight">
    </vue-virtual-table>

  </b-container>
</template>

<script>
  //import i18n from '../../../../i18n';
  //import store from '../../../../store';
  import { wtconfig } from '../../General/wtutils';
  //import { pms } from '../../General/pms';
  import VueVirtualTable from 'vue-virtual-table';

  const log = require("electron-log");
  export default {
    components: {
      VueVirtualTable
    },
    data() {
      return {
        tableConfig: [
          { prop: 'Title',searchable: true,sortable: true, width: 80 },
          { prop: 'File',searchable: true,sortable: true, width: 80 },
          { prop: 'Type',searchable: true,sortable: true, width: 30 },
          { prop: 'Status',searchable: true,sortable: true, width: 30 },
          { prop: 'Hash', isHidden: true }
        ],
        tableData: [],
        tableAttribute: {
          height: 1000,
          itemHeight: 50,
          minWidth: 10,
          selectable: true,
          enableExport: false,
          bordered: true,
          hoverHighlight: true,
          language: "en"
        }
      };
    },
    created() {
      log.info(`[Queue.vue] (created) - Download Queue Created`);
      this.GetQueue();
    },
    watch: {
    },
    computed: {
    },
    methods: {
      GetQueue(){
        log.info(`[Queue.vue] (GetQueue) - Get the queue`);

        console.log('Ged 41-3', wtconfig.get('Download.Queue'))
        const arrQueue = wtconfig.get('Download.Queue');
        for (var qItem in arrQueue){
          console.log('Ged 42-3', JSON.stringify(qItem));
          let entry = {};
          entry['Title'] = arrQueue[qItem]['title'];
          entry['File'] = arrQueue[qItem]['file'];
          entry['Type'] = arrQueue[qItem]['type'];
          entry['Status'] = 'GED Idle';
          entry['Hash'] = arrQueue[qItem];
          this.tableData.push(entry);     //Add qItem




          /* 
            { prop: 'File',searchable: true,sortable: true, width: 80 },
            { prop: 'Type',searchable: true,sortable: true, width: 30 },
            { prop: 'Status',searchable: true,sortable: true, width: 30 },
            { prop: 'Hash'

 */


        }

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
