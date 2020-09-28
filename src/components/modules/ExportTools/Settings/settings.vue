<template>
  <b-container fluid>
    <div class="col-lg-10 col-md-12 col-xs-12">
    <h1>{{ $t("Modules.ET.Settings.Settings") }}</h1>
    <p>{{ $t("Modules.ET.Settings.Description") }}</p>    
    <div>
        <b-input-group id="outDir" :prepend="$t('Modules.ET.Settings.SelectOutDir')" class="mt-3">                    
            <b-form-input id="outDirbox" name="outDirbox" v-model="outDirVal" :disabled=true v-bind:placeholder="$t('Modules.ET.Settings.SelectOutDir')" />                                    
            <b-input-group-append>                
                <b-button variant="info" v-on:click="browse">{{ $t("Modules.ET.Settings.Browse") }}</b-button>
            </b-input-group-append>
        </b-input-group>   
    </div>     
    <b-input-group id="ArraySepGrp" :prepend="$t('Modules.ET.Settings.ArraySep')" class="mt-3">
        <b-form-input id="ArraySep" name="ArraySep" type="text" class="form-control" v-model="ArraySep" :disabled=false :maxlength=1 @change="setArraySep()"></b-form-input>        
    </b-input-group>
    <b-input-group id="NotAvailIndicatorGrp" :prepend="$t('Modules.ET.Settings.NotAvailIndicator')" class="mt-3">
        <b-form-input id="NotAvailIndicator" name="NotAvailIndicator" type="text" class="form-control" v-model="NotAvailIndicator" :disabled=false @change="setNotAvailIndicator()"></b-form-input>        
    </b-input-group>
    <b-input-group id="ColumnSepGrp" :prepend="$t('Modules.ET.Settings.ColumnSep')" class="mt-3">
        <b-form-input id="ColumnSep" name="ColumnSep" type="text" class="form-control" v-model="ColumnSep" :disabled=false :maxlength=1 @change="setColumnSep"></b-form-input>
    </b-input-group>
    <b-input-group id="TimeOutGrp" :prepend="$t('Modules.ET.Settings.TimeOut')" class="mt-3">
        <b-form-input id="TimeOut" name="TimeOut" type="text" class="form-control" v-model="TimeOut" :disabled=false :maxlength=2 @change="setTimeOut()"></b-form-input>
    </b-input-group>
    <b-form-group id="b-form-group">
      <b-form-checkbox-group
        stacked
        :options="cbOptions"
        v-model="cbSelected"
        @change.native="filterTable">      
      </b-form-checkbox-group>
    </b-form-group>
          </div>    
  </b-container>
</template>

<script>
    const log = require("electron-log");
    import {wtutils, wtconfig, dialog} from '../../General/wtutils'
    
    log, wtutils, wtconfig, dialog
    import i18n from '../../../../i18n'
    export default { 
        created() {
            this.getcbDefaults();                        
            if (wtconfig.get('ET.ColumnSep') == '\t')
            {                
                this.ColumnSep = '{TAB}';
            }
            else
            {
                this.ColumnSep = wtconfig.get('ET.ColumnSep');                
            }         
        },
        data() {            
            return {
                outDirVal: wtconfig.get('ET.OutPath', i18n.t('Modules.ET.Settings.SelectOutDir')),
                ArraySep: wtconfig.get('ET.ArraySep'),
                NotAvailIndicator: wtconfig.get('ET.NotAvail', 'N/A'),               
                ColumnSep: '',                
                TimeOut: wtconfig.get('PMS.TimeOut'),
                cbSelected: [],                
                cbOptions: [
                    { text: i18n.t('Modules.ET.Settings.ExportToExcel'), value: 'ExpExcel' },
                    { text: i18n.t('Modules.ET.Settings.OrgTitleNull'), value: 'OrgTitleNull' },
                    { text: i18n.t('Modules.ET.Settings.SortTitleNull'), value: 'SortTitleNull' },
                    { text: i18n.t('Modules.ET.Settings.AutoXLSCol'), value: 'AutoXLSCol', disabled: true },
                    { text: i18n.t('Modules.ET.Settings.AutoXLSRow'), value: 'AutoXLSRow', disabled: true }                  
                ] 
            };              
        },                   
        methods: {
            getcbDefaults(){                
                const cbItems = ["ExpExcel", "OrgTitleNull", "SortTitleNull", "AutoXLSCol", "AutoXLSRow"];
                for(let i = 0; i < cbItems.length; i++){                     
                    if (wtconfig.get("ET." + cbItems[i], false)){
                        this.cbSelected.push(cbItems[i])
                    }                    
                }                
            },
            filterTable(){
                this.$nextTick(()=>{console.log(this.cbSelected);}) 
                for( var cbItem of ["ExpExcel","OrgTitleNull", "SortTitleNull", "AutoXLSCol", "AutoXLSRow"]){                    
                    wtconfig.set("ET." + cbItem, (this.cbSelected.includes(cbItem))) 
                }   
            },
            browse: function(){
                log.debug('Start browsing for Output Directory');
                const outDir = dialog.OpenDirectory( i18n.t("Modules.ET.Settings.SelectOutDir"), i18n.t("Common.Ok"));
                //const outDir = dialog.OpenDirectory('Title', 'OK');
                if (outDir)
                {
                    wtconfig.set('ET.OutPath', outDir[0]);
                    this.outDirVal = outDir[0];                    
                    log.debug(`Selected Directory is ${outDir}`);
                }               
            },
            setColumnSep(val){
                if (val.length > 1)
                {
                    this.$bvToast.toast(this.$t("Modules.ET.ErrorBadSep"), {
                        title: this.$t("Modules.ET.ErrorBadSepTitle"),
                        autoHideDelay: 3000,          
                        solid: true,
                        variant: 'primary',
                        toaster: 'b-toaster-bottom-center'
                    });
                }
                else
                {         
                    if (val == '9')
                    {
                        wtconfig.set('ET.ColumnSep', '\t') 
                        this.ColumnSep = '{TAB}'                   
                    }
                    else
                    {               
                        wtconfig.set('ET.ColumnSep', this.ColumnSep)
                    }
                }
            },            
            setArraySep: function(){
                wtconfig.set('ET.ArraySep', this.ArraySep)
            },
            setNotAvailIndicator: function(){
                wtconfig.set('ET.NotAvail', this.NotAvailIndicator)
            },
            setTimeOut: function(){
                wtconfig.set('PMS.TimeOut', this.TimeOut)
            }
        } 
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
