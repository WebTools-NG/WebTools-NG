<template>
    <b-container class="m-2 mt-2">
        <div>   <!-- Title and desc -->
            <h2>
                {{ $t(`Modules.ET.Custom.Title`) }}
            </h2>
            <h5>{{ $t(`Modules.ET.Custom.Description`) }}</h5>
        </div>
        <br>
        <!-- Media type to export -->
        <b-form-group id="etTypeGroup" v-bind:label="$t('Modules.ET.Custom.SelCustType')" label-size="lg" label-class="font-weight-bold pt-0">
            <b-form-select
                style="width: 50%"
                v-model="selMediaType"
                id="mediaType"
                :options="optionsMediaType"
                @change="changeType()"
                name="mediaType">
            </b-form-select>
            <WTNGtt tt="Modules.ET.Custom.TT-CustType" size="20px"></WTNGtt>
        </b-form-group>
        <div> <!-- Select Custom Level -->
            <b-form-group id="etLevelGroup" v-bind:label="$t('Modules.ET.Custom.CustomLevel')" label-size="lg" label-class="font-weight-bold pt-0">
                <b-form-select
                    style="width: 50%"
                    class="form-control"
                    v-model="selCustLevel"
                    ref="selLevel"
                    id="selLevel"
                    v-on:change="selectExportLevel"
                    :options="optionsLevels"
                    name="selLevel">
                </b-form-select>
                <WTNGtt tt="Modules.ET.Custom.TT-ETEditLevel" size="20px"></WTNGtt>
            </b-form-group>
        </div>
        <b-modal ref="showNewLevel" hide-footer v-bind:title=this.customTitle @hide="newLevelHidden">
            <div class="d-block text-center">
                <b-form-input v-model="NewLevelName" v-bind:placeholder=this.NewLevelInputTxt></b-form-input>
            </div>
            <b-button class="mt-3" variant="outline-primary" block @click="addNewLevel" :disabled="this.btnAddNewLevelEnabled">{{ this.NewLevelSaveTxt }}</b-button>
        </b-modal>
        <b-modal ref="confirmDeleteLevel" hide-footer v-bind:title=this.deleteLevel >
            <div class="d-block text-center">
                {{ $t('Modules.ET.Custom.confirmDelete', [this.selCustLevel]) }}
            </div>
            <b-button class="mt-3" variant="info" block @click="deleteClose">{{ $t('Modules.ET.Custom.Cancel') }}</b-button>
            <b-button class="mt-3" variant="danger" block @click="deleteCustomLevel">{{ $t('Modules.ET.Custom.Delete') }}</b-button>
        </b-modal>
        <div id="buttons" class="text-center"> <!-- Buttons -->
            <b-button-group >
                <b-button variant="success" class="mr-1" :disabled="this.btnSaveEnabled == 0" @click="saveCustomLevel"> {{ $t('Modules.ET.Custom.btnSave') }} </b-button>
                <b-button variant="danger" class="mr-1" :disabled="this.btnDeleteEnabled == 0" @click="confirmDeleteLevel">{{ $t('Modules.ET.Custom.btnDelete') }}</b-button>
            </b-button-group>
        </div>
        <b-container fluid>
            <b-row>
                <b-col cols="6">
                    <b-card-group deck>
                        <b-card no-body :header= "$t(`Modules.ET.Custom.availFields`)" class="font-weight-bold pt-0">
                            <b-list-group>
                                <draggable class="list-group" :list="fieldList" group="fields">
                                    <div class="list-group-item font-weight-normal" v-for="(element) in fieldList" :key="element.name">
                                        {{ element.name }}
                                    </div>
                                </draggable>
                            </b-list-group>
                        </b-card>
                    </b-card-group>
                </b-col>
                <b-col cols="6">
                    <b-card-group deck>
                        <b-card no-body :header="$t('Modules.ET.Custom.customFields')" class="font-weight-bold pt-0">
                            <draggable class="list-group" :list="resultList" group="fields">
                                <div class="list-group-item font-weight-normal" v-for="(element) in resultList" :key="element.name">
                                    {{ element.name }}
                                </div>
                            </draggable>
                        </b-card>
                    </b-card-group>
                </b-col>
            </b-row>
        </b-container>
    </b-container>
</template>

<script>
  import { et } from "../scripts/et";
  import i18n from '../../../../i18n';
  import { wtconfig, dialog } from '../../General/wtutils';
  import draggable from 'vuedraggable';
  import WTNGtt from '../../General/wtng-tt.vue';

  const log = require("electron-log");

  export default {
    components: {
        draggable,
        WTNGtt
    },
    data() {
        return {
            selMediaType: "movie",
            optionsMediaType: [
                { text: i18n.t('Modules.ET.Custom.optCustExpType.Movies'), value: et.ETmediaType.Movie, disabled: false },
                { text: i18n.t('Modules.ET.Custom.optCustExpType.TVSeries'), value: et.ETmediaType.Show, disabled: false },
                { text: i18n.t('Modules.ET.Custom.optCustExpType.TVEpisodes'), value: et.ETmediaType.Episode, disabled: false },
                { text: i18n.t('Modules.ET.Custom.optCustExpType.AudioArtist'), value: et.ETmediaType.Artist, disabled: false },
                { text: i18n.t('Modules.ET.Custom.optCustExpType.AudioAlbum'), value: et.ETmediaType.Album, disabled: false },
                { text: i18n.t('Modules.ET.Custom.optCustExpType.AudioTrack'), value: et.ETmediaType.Track, disabled: false },
                { text: i18n.t('Modules.ET.Custom.optCustExpType.Photos'), value: et.ETmediaType.Photo, disabled: false },
                { text: i18n.t('Modules.ET.Custom.optCustExpType.PlaylistAudio'), value: et.ETmediaType.Playlist_Audio, disabled: false },
                { text: i18n.t('Modules.ET.Custom.optCustExpType.PlaylistPhoto'), value: et.ETmediaType.Playlist_Photo, disabled: false },
                { text: i18n.t('Modules.ET.Custom.optCustExpType.PlaylistVideo'), value: et.ETmediaType.Playlist_Video, disabled: false }
            ],
            selCustLevel: "",
            deleteLevel: this.$t('Modules.ET.Custom.DeleteLevel'),
            customTitle: this.$t('Modules.ET.Custom.NewLevelTitle'),
            NewLevelInputTxt: this.$t('Modules.ET.Custom.NewLevelName'),
            NewLevelSaveTxt: this.$t('Modules.ET.Custom.NewLevelSaveTxt'),
            NewLevelName: '',
            editable: true,
            isDragging: false,
            delayedDragging: false,
            fieldList: [],
            btnDeleteEnabled: false,
            btnSaveEnabled: false,
            btnAddNewLevelEnabled: true,
            optionsLevels: null,
            resultList: []
        }
    },
    watch: {
        NewLevelName(){
            this.btnAddNewLevelEnabled = (this.NewLevelName == '');
        },
        selCustLevel(){
            this.btnSaveEnabled = ( (this.selCustLevel != "") && ( this.selCustLevel != "NewLevel"));
        },
        isDragging(newValue) {
            if (newValue) {
                this.delayedDragging = true;
                return;
            }
            this.$nextTick(() => {
                this.delayedDragging = false;
            });
        }
    },
    computed: {
        dragOptions() {
            return {
                animation: 0,
                group: "description",
                disabled: !this.editable,
                ghostClass: "ghost"
            };
        },
        listString() {
            return JSON.stringify(this.list, null, 2);
        }
    },
    mounted() {
        log.debug('Custom level page selected')
        // Populate combobox
        this.genExportLevels();
    },
    methods: {
        newLevelHidden(){
            if (this.NewLevelName === '')
            {
                this.selCustLevel = '';
            }
        },
        getCustomLevel() {
            log.debug(`Customlevel ${this.selCustLevel} selected`);
            if (this.selCustLevel != 'NewLevel'){
                // Get fields from config.json file
                let custLevel = wtconfig.get(`ET.CustomLevels.${this.selMediaType}.level.${this.selCustLevel}`);
                // Do we need to export art?
                if ( wtconfig.get(`ET.CustomLevels.${this.selMediaType}.Art.${this.selCustLevel}`, false) )
                {
                    custLevel.push("Export Art");
                }
                // Do we need to export show art?
                if ( wtconfig.get(`ET.CustomLevels.${this.selMediaType}.ShowArt.${this.selCustLevel}`, false) )
                {
                    custLevel.push("Export Show Art");
                }
                // Do we need to export posters?
                if ( wtconfig.get(`ET.CustomLevels.${this.selMediaType}.Posters.${this.selCustLevel}`, false) )
                {
                    custLevel.push("Export Posters");
                }
                // Do we need to export season posters?
                if ( wtconfig.get(`ET.CustomLevels.${this.selMediaType}.SeasonPosters.${this.selCustLevel}`, false) )
                {
                    custLevel.push("Export Season Posters");
                }
                // Do we need to export show posters?
                if ( wtconfig.get(`ET.CustomLevels.${this.selMediaType}.ShowPosters.${this.selCustLevel}`, false) )
                {
                    custLevel.push("Export Show Posters");
                }
                // Add to resultList
                this.resultList = custLevel.map((name, index) => {
                        return { name, order: index + 1, fixed: false };
                    });
                log.debug(`Custom level ${this.selCustLevel} is set as: ${ JSON.stringify(this.resultList) }`);
                // Now remove already added from avail fields
                for (var idx in custLevel){
                    for (var availidx in this.fieldList){
                        if (custLevel[idx] == this.fieldList[availidx].name)
                        {
                            this.fieldList.splice(availidx,1)
                        }
                    }
                }
            }
        },
        deleteClose() {
            this.$refs['confirmDeleteLevel'].hide();
            log.info('Delete aborted');
        },
        orderList() {
            this.list = this.list.sort((one, two) => {
            return one.order - two.order;
            });
        },
        onMove({ relatedContext, draggedContext }) {
        const relatedElement = relatedContext.element;
        const draggedElement = draggedContext.element;
        return (
            (!relatedElement || !relatedElement.fixed) && !draggedElement.fixed
        );
        },
        genExportLevels() {
            // Returns valid levels for selected media type
            const etCustomLevel = et.getCustomLevels(this.selMediaType);
            const options = [];
            const item = {};
            let custLabel = {};
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
            this.optionsLevels = options;
        },
        addNewLevel(){
            // Hide Modal box
            this.$refs['showNewLevel'].hide();
            // Get current level names
            //const revSelMediaType = et.getLibTypeName(this.selMediaType);
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
            // Get current level names
            let curLevel = wtconfig.get(`ET.CustomLevels.${this.selMediaType}.level`);
            // Add new level to JSON
            curLevel[this.NewLevelName] = [];
            // Save
            wtconfig.set(`ET.CustomLevels.${this.selMediaType}.level`, curLevel);
            // Update combobox
            this.genExportLevels();
            //this.exportLevels;
            this.selCustLevel = this.NewLevelName;
        },
        updateLevelCount() {
            // We need to load fields and defs into def var
            var def = JSON.parse(JSON.stringify(require('./../defs/def-Fields.json')));
            var fields = def['fields'];
            // Release def memory again
            def = null;
            const levelFields = wtconfig.get(`ET.CustomLevels.${this.selMediaType}.level.${this.selCustLevel}`);
            let curLevel = 0;
            let includeFields = '';
            levelFields.forEach(function (item) {
                // Get field level
                var count = fields[item]['call'];
                if (count > curLevel)
                {
                    curLevel = count;
                }
                // Get Include
                var includeField = fields[item]['include'];
                if ( typeof includeField !== 'undefined' && includeField )
                {
                    if ( includeFields == '')
                    {
                        includeFields = includeField;
                    }
                    else if ( !includeFields.includes(includeField))
                    {
                        includeFields = includeFields + '&' + includeField;
                    }
                }
            });
            log.info(`[custom.vue] (updateLevelCount) LevelCount for "${this.selCustLevel}" of the type "${this.selMediaType}" was calculated as:${curLevel}`);
            wtconfig.set(`ET.CustomLevels.${this.selMediaType}.LevelCount.${this.selCustLevel}`, curLevel);
            log.info(`[custom.vue] (updateLevelCount) includeFields for "${this.selCustLevel}" of the type "${this.selMediaType}" was calculated as:${includeFields}`);
            wtconfig.set(`ET.CustomLevels.${this.selMediaType}.Include.${this.selCustLevel}`, includeFields);
        },
        changeType: function() {
            // Triggers when lib type is changed
            log.verbose(`Custom level type selected as ${(et.RevETmediaType[this.selMediaType]).toLowerCase()}`)
            this.genExportLevels();
            this.btnDeleteEnabled = false;
            this.resultList = [];
            this.selCustLevel = "";
            this.fieldList = [];
        },
        deleteCustomLevel() {
            //const revSelCustLevel = et.getLibTypeName(this.selMediaType);
            log.info(`User confirmed to delete custom level: ${this.selCustLevel}`);
            this.$refs['confirmDeleteLevel'].hide();
            wtconfig.delete(`ET.CustomLevels.${this.selMediaType}.levels.${this.selCustLevel}`);
            wtconfig.delete(`ET.CustomLevels.${this.selMediaType}.LevelCount.${this.selCustLevel}`);
            wtconfig.delete(`ET.CustomLevels.${this.selMediaType}.level.${this.selCustLevel}`);
            wtconfig.delete(`ET.CustomLevels.${this.selMediaType}.Posters.${this.selCustLevel}`);
            wtconfig.delete(`ET.CustomLevels.${this.selMediaType}.Art.${this.selCustLevel}`);
            wtconfig.delete(`ET.CustomLevels.${this.selMediaType}.Include.${this.selCustLevel}`);
            this.genExportLevels();
            this.resultList = [];
        },
        saveCustomLevel() {
            let result = []
            let bExportArt = false;
            let bExportShowArt = false;
            let bExportPosters = false;
            let bExportSeasonPosters = false;
            let bExportShowPosters = false;
            for(var k in this.resultList) {
                if (this.resultList[k].name == 'Export Posters')
                {
                    bExportPosters = true;
                }
                else if (this.resultList[k].name == 'Export Art')
                {
                    bExportArt = true;
                }
                else if (this.resultList[k].name == 'Export Show Art')
                {
                    bExportShowArt = true;
                }
                else if (this.resultList[k].name == 'Export Season Posters')
                {
                    bExportSeasonPosters = true;
                }
                else if (this.resultList[k].name == 'Export Show Posters')
                {
                    bExportShowPosters = true;
                }
                else
                {
                    result.push(this.resultList[k].name);
                }
            }
            wtconfig.set(`ET.CustomLevels.${this.selMediaType}.Posters.${this.selCustLevel}`, bExportPosters);
            wtconfig.set(`ET.CustomLevels.${this.selMediaType}.SeasonPosters.${this.selCustLevel}`, bExportSeasonPosters);
            wtconfig.set(`ET.CustomLevels.${this.selMediaType}.ShowPosters.${this.selCustLevel}`, bExportShowPosters);
            wtconfig.set(`ET.CustomLevels.${this.selMediaType}.Art.${this.selCustLevel}`, bExportArt);
            wtconfig.set(`ET.CustomLevels.${this.selMediaType}.ShowArt.${this.selCustLevel}`, bExportShowArt);
            // Get current level names
            let curLevel = wtconfig.get(`ET.CustomLevels.${this.selMediaType}.level`);
            // Add new level to JSON
            curLevel[this.selCustLevel] = result;
            log.info(`Saving custom level ${this.selCustLevel} as ${JSON.stringify(result)}`)
            wtconfig.set(`ET.CustomLevels.${this.selMediaType}.level`, curLevel);
            // Now we need to update levelcount for the level
            this.updateLevelCount();
            dialog.ShowMsgBox( i18n.t("Modules.ET.Custom.AlertSaved"), 'info', i18n.t("Modules.ET.Custom.Title"), [i18n.t("Common.Ok")]);
            this.getCustomLevel();
        },
        confirmDeleteLevel() {
            log.info(`User asked to delete a custom level`);
            this.$refs['confirmDeleteLevel'].show();
        },
        selectExportLevel: async function(value) {
            // this.btnSaveEnabled = ( this.selCustLevel != "");
            log.info(`Custom ExportLevel selected as: ${value}`)
            if ( value == 'NewLevel') {
                // Create new level
                this.NewLevelName = "";
                this.$refs['showNewLevel'].show();
            }
            else {
                this.btnDeleteEnabled = true;
                this.selCustLevel = value;
                //this.btnSaveEnabled = ( this.selCustLevel != "");
            }
            this.resultList = [];
            await this.genExportLevels();
            this.fieldList = et.getAllFields( {libType: this.selMediaType});
            this.getCustomLevel();
        }
      }
    };
</script>


<style scoped>
.list-group{
    /* width: 350px; */
    width:auto;
    height: 200px;
    margin-bottom: 10px;
    /*overflow:scroll; */
    overflow-y:auto;
    min-height: 20px;
    /* -webkit-overflow-scrolling: touch; */
    /* margin-right: 10px; */
    /* margin-left: 10px; */
}

.ghost {
  opacity: 0.5;
  background: #c8ebfb;
}

.list-group-item {
  cursor: move;
}
.list-group-item i {
  cursor: pointer;
}

#buttons {
    width: auto;
    margin-top: 5px;
    margin-bottom: 15px;
}

</style>