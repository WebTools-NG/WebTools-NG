<template>
  <b-container fluid>
    <div class="col-lg-10 col-md-12 col-xs-12">
        <h1>{{ $t("Modules.PMS.Settings.Settings") }}</h1>
        <p>{{ $t("Modules.PMS.Settings.Description") }}</p>           
    </div>   
    <div class="d-flex align-items-center">
      <b-form-group id="etLibraryGroup" v-bind:label="$t('Modules.PMS.Settings.SelectSettingsSelection')" label-size="lg" label-class="font-weight-bold pt-0">        
        <!--         
        <div ref="libSpinner" id="libSpinner" :hidden="selLibraryWait">
        <b-spinner id="libLoad" class="ml-auto text-danger"></b-spinner>
        </div>
        -->
        <b-tooltip target="etLibraryGroup" triggers="hover">
          {{ $t('Modules.PMS.Settings.TTSelectSettingsSelection') }}
        </b-tooltip>
        <b-form-select 
          v-model="selSection"          
          id="selSection"          
          :options="selselSectionOptions"
          name="selSection">        
        </b-form-select>
      </b-form-group>      
    </div>
  </b-container>
</template>

<script>
    const log = require("electron-log");
    import {wtutils, wtconfig, dialog} from '../../General/wtutils'
    import i18n from '../../../../i18n'

    log, wtutils, wtconfig, dialog, i18n
    

    

    export default {        
        data() {            
            return {
                selselSectionOptions: ['ged1', 'ged2']                
            };              
        },        
    };    

</script>
<style scoped>
    .outDirbox{
        margin-right:10px;
    }
    #b-form-group{
        margin-top: 20px;
    }
    
</style>
