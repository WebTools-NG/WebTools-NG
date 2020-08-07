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
  </section>
</template>
<script>
    const log = require("electron-log");
    import {wtutils, wtconfig, dialog} from '../../../../wtutils'    
    log, wtutils, wtconfig, dialog
    import i18n from '../../../../i18n'
    export default { 
        data() {            
            return {
                outDirVal: wtconfig.get('ET.OutPath', i18n.t('Modules.ET.Settings.SelectOutDir')),
                ArraySep: wtconfig.get('ET.ArraySep'),
                ColumnSep: wtconfig.get('ET.ColumnSep')
            };      
        
        },
        methods: {
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
            }
        } 
    };    

</script>
<style scoped>
    .outDirbox{
        margin-right:10px;
    }
    #row{
        margin-top: 10px;
    }
    
</style>
