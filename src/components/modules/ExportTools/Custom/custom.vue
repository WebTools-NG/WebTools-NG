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

        <div> <!-- Select Custom Level -->    
            <b-form-group id="etLevelGroup" v-bind:label="$t('Modules.ET.Custom.CustomLevel')" label-size="lg" label-class="font-weight-bold pt-0">  
                <b-tooltip target="etLevelGroup" triggers="hover">
                    {{ $t('Modules.ET.TT-ETLevel') }}
                </b-tooltip>            
                <b-form-select
                    class="form-control"
                    :v-model="selLevel"
                    id="selLevel"
                    v-on:change="selectExportLevel"                              
                    :options="exportLevels"
                    name="selLevel">         
                </b-form-select>
            </b-form-group>     
        </div>

        <b-modal ref="showNewLevel" hide-footer v-bind:title=this.customTitle >
          <div class="d-block text-center">
              <b-form-input v-model="NewLevelName" v-bind:placeholder=this.NewLevelInputTxt ></b-form-input>            
          </div>
          <b-button class="mt-3" variant="outline-primary" block @click="addNewLevel">{{ this.NewLevelSaveTxt }}</b-button>
        </b-modal>

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
            selLevel: "",
            customTitle: this.$t('Modules.ET.Custom.NewLevelTitle'),
            NewLevelInputTxt: this.$t('Modules.ET.Custom.NewLevelName'),
            NewLevelSaveTxt: this.$t('Modules.ET.Custom.NewLevelSaveTxt'),                        
            NewLevelName: '' 
        }
      },
      computed: {
          exportLevels: function() { 
              console.log('Ged ExportLevels updated');
            et.getLevelDisplayName('My Level', this.selMediaType);
            // Returns valid levels for selected media type
           // let targetType = this.selMediaType;
           // const etLevel = et.getLevels(targetType);
            const etCustomLevel = et.getCustomLevels(this.selMediaType);      
            const options = []
            const item = {}
            let custLabel = {}
            custLabel['text']=this.$t('Modules.ET.Custom.CustomLevels');      
            custLabel['disabled']=true;
            custLabel['value']='';
            options.push(custLabel); 
            let newLabel = {}    
            newLabel['text']=this.$t('Modules.ET.Custom.NewCustomLevel');      
            newLabel['disabled']=false;
            newLabel['value']='NewLevel'; 
            options.push(newLabel); 
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
            item['options']=options;      
            return options;              
        }
      },
      methods: {
        addNewLevel(){
            console.log('Ged addNewLevel: ' + this.NewLevelName);
            // Hide Modal box
            this.$refs['showNewLevel'].hide();
            // Get current level names
            let curLevels = wtconfig.get(`ET.CustomLevels.${this.selMediaType}.levels`);
            // Add new level to JSON
            curLevels[this.NewLevelName] = this.NewLevelName;
            // Save
            wtconfig.set(`ET.CustomLevels.${this.selMediaType}.levels`, curLevels);
            // Get current level counts
            let curLevelCount = wtconfig.get(`ET.CustomLevels.${this.selMediaType}.LevelCount`);
            // Add new level to JSON
            curLevelCount[this.NewLevelName] = 0;
            // Save
            wtconfig.set(`ET.CustomLevels.${this.selMediaType}.LevelCount`, curLevelCount);
            // Update combobox
            this.exportLevels;
            console.log('Ged combo updated: ' + JSON.stringify(this.selLevel));
            this.selLevel = this.NewLevelName;      

        },
        changeType: function() {
            // Triggers when lib type is changed
            //this.selMediaType = '';            
            console.log('Ged selMediaType: ' + this.selMediaType);
        },
        selectExportLevel: function(value) {      
            console.log('Ged Custom ExportLevel selected as: ' + value)
            if ( value == 'NewLevel') {
                console.log('Ged new level selected');
                this.$refs['showNewLevel'].show();
                console.log('Ged2 new level selected');

            }
            else {
                console.log('Ged edit level: ' + value)
            }

        }
      }
    };  
</script>