<template>
  <section class="section">
    <h1 class="title is-3">{{ $t("Modules.ET.Settings.Settings") }}</h1>
    <h2 class="subtitle">{{ $t("Modules.ET.Settings.Description") }}</h2>    
    <div>
        <b-input-group id="outDir" :prepend="$t('Modules.ET.Settings.SelectOutDir')" class="mt-3">                    
            <b-form-input id="outDirbox" name="outDirbox" v-model="outDirVal" :disabled=true v-bind:placeholder="$t('Modules.ET.Settings.SelectOutDir')" />                                    
            <b-input-group-append>                
                <b-button variant="info" v-on:click="browse">{{ $t("Modules.ET.Settings.Browse") }}</b-button>
            </b-input-group-append>
        </b-input-group>   
    </div>     
    <b-input-group id="ArraySep" :prepend="$t('Modules.ET.Settings.ArraySep')" class="mt-3">
        <b-form-input id="ArraySep" name="ArraySep" type="text" class="form-control" v-model="ArraySep" :disabled=false :maxlength=1 @change="setArraySep()"></b-form-input>        
    </b-input-group>
    <b-input-group id="ColumnSep" :prepend="$t('Modules.ET.Settings.ColumnSep')" class="mt-3">
        <b-form-input id="ColumnSep" name="ColumnSep" type="text" class="form-control" v-model="ColumnSep" :disabled=false :maxlength=1 @change="setColumnSep()"></b-form-input>
    </b-input-group>
    <b-input-group id="TimeOut" :prepend="$t('Modules.ET.Settings.TimeOut')" class="mt-3">
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
  </section>
</template>
<script>
    const log = require("electron-log");
    import {wtutils, wtconfig, dialog} from '../../../../wtutils'    
    log, wtutils, wtconfig, dialog
    import i18n from '../../../../i18n'
    export default { 
        created() {
            this.getcbDefaults()
        },
        data() {            
            return {
                outDirVal: wtconfig.get('ET.OutPath', i18n.t('Modules.ET.Settings.SelectOutDir')),
                ArraySep: wtconfig.get('ET.ArraySep'),
                ColumnSep: wtconfig.get('ET.ColumnSep'),
                TimeOut: wtconfig.get('PMS.TimeOut'),
                cbSelected: [],
                cbOptions: [
                    { text: i18n.t('Modules.ET.Settings.OrgTitleNull'), value: 'OrgTitleNull' },
                    { text: i18n.t('Modules.ET.Settings.SortTitleNull'), value: 'SortTitleNull' },
                    { text: i18n.t('Modules.ET.Settings.AutoXLSCol'), value: 'AutoXLSCol' },
                    { text: i18n.t('Modules.ET.Settings.AutoXLSRow'), value: 'AutoXLSRow' }
                ] 
            };              
        },
        methods: {
            getcbDefaults(){                
                const cbItems = ["OrgTitleNull", "SortTitleNull", "AutoXLSCol", "AutoXLSRow"];
                for(let i = 0; i < cbItems.length; i++){                     
                    if (wtconfig.get("ET." + cbItems[i], false)){
                        this.cbSelected.push(cbItems[i])
                    }                    
                }                
            },
            filterTable(){
                this.$nextTick(()=>{console.log(this.cbSelected);}) 
                for( var cbItem of ["OrgTitleNull", "SortTitleNull", "AutoXLSCol", "AutoXLSRow"]){                    
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
            setColumnSep: function(){                
                wtconfig.set('ET.ColumnSep', this.ColumnSep)
            },
            setArraySep: function(){
                wtconfig.set('ET.ArraySep', this.ArraySep)
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
