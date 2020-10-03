<template>
    <b-container fluid>
        <div class="col-lg-10 col-md-12 col-xs-12">
            <h1>{{ $t("Modules.ET.Custom.Title") }}</h1>
            <p>{{ $t("Modules.ET.Custom.Description") }}</p>
        </div>
        <br />

        <!-- Media type to export -->      
        <b-form-group id="etTypeGroup" v-bind:label="$t('Modules.ET.HSelectMedia')" label-size="lg" label-class="font-weight-bold pt-0">
            <b-tooltip target="etTypeGroup" triggers="hover">
                {{ $t('Modules.ET.TT-ETType') }}
            </b-tooltip>
            <b-form-radio-group
                id="mediaType"
                v-model="selMediaType"
                @change.native="changeType()"
                :options="optionsMediaType"
                name="mediaType">
            </b-form-radio-group>
        </b-form-group>

        <div> <!-- Select Export Level -->    
            <b-form-group id="etLevelGroup" v-bind:label="$t('Modules.ET.ExportLevel')" label-size="lg" label-class="font-weight-bold pt-0">  
                <b-tooltip target="etLevelGroup" triggers="hover">
                {{ $t('Modules.ET.TT-ETLevel') }}
                </b-tooltip>            
                <b-form-select
                class="form-control"
                v-model="selLevel"
                id="selLevel"          
                @change.native="selectExportLevel()"
                :options="exportLevels"
                name="selLevel">         
                </b-form-select>
            </b-form-group>     
        </div>
    </b-container>
    
</template>

<script>
  import { et } from "../scripts/et";  
  import i18n from '../../../../i18n';  
  import store from '../../../../store';
  import { wtconfig } from '../../General/wtutils';  
  
  const log = require("electron-log");

  log, et, i18n, store, wtconfig

  export default {
      data() {
        return {
            selMediaType: "movie",
            optionsMediaType: [
                { text: i18n.t('Modules.ET.RadioMovies'), value: 'movie', disabled: false },            
                { text: i18n.t('Modules.ET.RadioTVSeries'), value: 'show', disabled: true }, 
                { text: i18n.t('Modules.ET.RadioTVEpisodes'), value: 'episode', disabled: false },
                { text: i18n.t('Modules.ET.RadioTVShowEpisodes'), value: 'showepisode', disabled: true },             
                { text: i18n.t('Modules.ET.RadioMusic'), value: 'artist', disabled: true },
                { text: i18n.t('Modules.ET.RadioPhotos'), value: 'photo', disabled: true },           
                { text: i18n.t('Modules.ET.RadioPlayLists'), value: 'playlist', disabled: true }
                
            ],
            selLevel: ""  
        }
      },
      computed: {
          exportLevels: function() {         
            et.getLevelDisplayName('My Level', this.selMediaType);
            // Returns valid levels for selected media type
            let targetType = this.selMediaType;
            const etLevel = et.getLevels(targetType);
            const etCustomLevel = et.getCustomLevels(this.selMediaType);      
            const options = []
            const item = {}
            let custLabel = {}
            custLabel['text']=this.$t('Modules.ET.CustomLevels');      
            custLabel['disabled']=true;
            custLabel['value']='';
            options.push(custLabel);      
            Object.keys(etCustomLevel).forEach(function(key) {        
                let option = {}
                option['value'] = etCustomLevel[key];         
                if (key === "No Level Yet") {          
                option['text']=i18n.t('Modules.ET.NoLevelFound');          
                option['disabled'] = true;          
                } 
                else { option['text'] = key; }                       
                options.push(option);        
            });      
            let buildinLabel = {}
            buildinLabel['text']=this.$t('Modules.ET.BuildInLevels');      
            buildinLabel['disabled']=true;
            buildinLabel['value']='';
            options.push(buildinLabel);      
            Object.keys(etLevel).forEach(function(key) {        
                let option = {}
                option['value'] = etLevel[key];
                if (key === "No Level Yet") {          
                option['text']=i18n.t('Modules.ET.NoLevelFound');          
                option['disabled'] = true;          
                } 
                else { option['text'] = key; }        
                if (wtconfig.get('Developer.showDevLevels'))
                {
                options.push(option); 
                }
                else
                {
                if (!option['text'].startsWith('dev'))
                {
                    options.push(option); 
                }
                }         
            });      
            item['options']=options;      
            return options;              
        }
      },
      methods: {
            changeType: function() {
                // Triggers when lib type is changed
                //this.selMediaType = '';            
                console.log('Ged selMediaType: ' + this.selMediaType);
            },
            selectExportLevel: function() {      
                console.log('Ged Custom ExportLevel selected')
            }
      }
    };  
</script>