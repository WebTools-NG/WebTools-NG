<template>
  <section class="section">
    <h1 class="title is-3">{{ $t("Modules.ET.Settings.Settings") }}</h1>
    <h2 class="subtitle">{{ $t("Modules.ET.Settings.Description") }}</h2>
    <br />
    <div id="outDir">
        <input id="outDirbox" name="outDirbox" v-model="outDirVal" :disabled=true v-bind:placeholder="$t('Modules.ET.Settings.SelectOutDir')">                        
        <button v-on:click="browse">{{ $t("Modules.ET.Settings.Browse") }}</button>        
    </div>                

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
                outDirVal: wtconfig.get('ET.OutPath', i18n.t('Modules.ET.Settings.SelectOutDir'))
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
            }
        } 
    };    

</script>
<style scoped>
    #outDirbox{
        margin-right:10px;
    }
</style>
