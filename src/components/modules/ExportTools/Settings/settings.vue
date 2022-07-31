<template>
  <b-container class="m-2 mt-2">
    <div>   <!-- Title and desc -->
      <h2>
        {{ $t(`Modules.ET.Settings.Name`) }}
      </h2>
      <h5>{{ $t(`Modules.ET.Settings.Description`) }}</h5>
    </div>
    <b-link id="general" :to="{ path: '/settings/export', query: { return: 'exportsettings' } }">{{ $t("Modules.ET.Settings.Note") }} </b-link>
    <br>
    <b-input-group id="PosterGrp" :prepend="$t('Modules.ET.Settings.Posters_Dimensions')" class="mt-3">
        <b-tooltip target="PosterGrp" triggers="hover">
            {{ $t('Modules.ET.Settings.Posters_Dimensions_TT') }}
        </b-tooltip>
        <b-form-input id="PosterDim" name="PosterDim" type="text" class="form-control" v-model="PosterDim" :disabled=PosterDimDisabled @change="setPosters_Dimensions()"></b-form-input>
    </b-input-group>
    <b-input-group id="ArtGrp" :prepend="$t('Modules.ET.Settings.Art_Dimensions')" class="mt-3">
        <b-tooltip target="ArtGrp" triggers="hover">
            {{ $t('Modules.ET.Settings.Art_Dimensions_TT') }}
        </b-tooltip>
        <b-form-input id="ArtDim" name="ArtDim" type="text" class="form-control" v-model="ArtDim" :disabled=ArtDimDisabled @change="setArt_Dimensions()"></b-form-input>
    </b-input-group>
    <b-form-group id="b-form-group">
    <b-form-checkbox-group
        stacked
        :options="cbOptions"
        v-model="cbSelected"
        @change.native="filterTable">
    </b-form-checkbox-group>
    </b-form-group>
    <b-form-group id="etSugMovieID" v-bind:label="$t('Modules.ET.Settings.MoviesUseId')" label-size="lg" label-class="font-weight-bold pt-0" v-b-tooltip.hover="$t('Modules.ET.Settings.ttMoviesUseId')">
            <b-form-select
                class="form-control"
                v-model="SelectedMoviesID"
                id="SelectedMoviesID"
                :options="SelectedMoviesIDOptions"
                @change="SelectedMoviesIDChanged"
                style="width: 50%"
                name="SugMovieID">
            </b-form-select>
    </b-form-group>
    <!-- Buttons -->
    <div class="buttons">
        <!-- Buttons -->
        <div id="buttons" class="text-center">
            <b-button-group >
                <b-button variant="success" class="mr-1" @click="jumpToET"> {{ $t('Modules.ET.Settings.Return') }} </b-button>
            </b-button-group>
        </div>
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
            this.getDefaults();
            // alert('For this version, export to XLSX is currently disabled');
            this.showAlert();
        },
        data() {
            return {
                PosterDimDisabled: false,
                ArtDimDisabled: false,
                PosterDim: wtconfig.get('ET.Posters_Dimensions', '75*75'),
                ArtDim: wtconfig.get('ET.Art_Dimensions', '75*75'),
                cbSelected: [],
                cbOptions: [
                    { text: i18n.t('Modules.ET.Settings.ArtPostersOrigen'), value: 'ArtPostersOrigen' },
                    { text: i18n.t('Modules.ET.Settings.ExportToCSV'), value: 'ExpCSV' },
                    { text: i18n.t('Modules.ET.Settings.ExportToExcel'), value: 'ExpXLSX', disabled: true },
                    { text: i18n.t('Modules.ET.Settings.OrgTitleNull'), value: 'OrgTitleNull' },
                    { text: i18n.t('Modules.ET.Settings.SortTitleNull'), value: 'SortTitleNull' },
                    { text: i18n.t('Modules.ET.Settings.suggestedFileNoExtra'), value: 'suggestedFileNoExtra' },
                    { text: i18n.t('Modules.ET.Settings.suggestedUseOrigenTitle'), value: 'suggestedUseOrigenTitle' },
                    { text: i18n.t('Modules.ET.Settings.NoTimeStamp'), value: 'NoTimeStamp' },
                    { text: i18n.t('Modules.ET.Settings.NoItemRange'), value: 'NoItemRange' }
                ],
                SelectedMoviesIDOptions: ['imdb', 'tmdb'],
                SelectedMoviesID: '',
                SelectedShowsIDOptions: ['tmdb', 'tvdb'],
                SelectedShowsID: ''
            };
        },
        methods: {
            // Return to ET
            jumpToET(){
                this.$router.push({ name: 'export' })
            },
            showAlert(){
                dialog.ShowMsg( i18n.t("Modules.ET.Name"), i18n.t("Common.Ok"), i18n.t("Common.AppName"), 'For this version, export to XLSX is currently disabled', 'info');
            },
            getDefaults(){
                const cbItems = ["ExpCSV","ExpXLSX", "OrgTitleNull", "SortTitleNull", "suggestedFileNoExtra", "suggestedUseOrigenTitle", "NoTimeStamp", "NoItemRange", "ArtPostersOrigen"];
                for(let i = 0; i < cbItems.length; i++){
                    if (wtconfig.get("ET." + cbItems[i], false)){
                        this.cbSelected.push(cbItems[i]);
                    }
                }
                this.PosterDimDisabled = this.cbSelected.includes('ArtPostersOrigen');
                this.ArtDimDisabled = this.cbSelected.includes('ArtPostersOrigen');
                this.SelectedMoviesID = wtconfig.get("ET.SelectedMoviesID", "imdb");
            },
            SelectedMoviesIDChanged(){
                wtconfig.set("ET.SelectedMoviesID", this.SelectedMoviesID);
            },
            filterTable(){
                this.$nextTick(()=>{console.log(this.cbSelected);})
                for( var cbItem of ["ExpCSV","ExpXLSX","OrgTitleNull", "SortTitleNull", "AutoXLSCol", "AutoXLSRow", "suggestedFileNoExtra", "suggestedUseOrigenTitle", "NoTimeStamp", "NoItemRange", "ArtPostersOrigen"]){
                    wtconfig.set("ET." + cbItem, (this.cbSelected.includes(cbItem)))
                }
                this.PosterDimDisabled = this.cbSelected.includes('ArtPostersOrigen');
                this.ArtDimDisabled = this.cbSelected.includes('ArtPostersOrigen');
            },
            setPosters_Dimensions: function(){
                wtconfig.set('ET.Posters_Dimensions', this.PosterDim);
            },
            setArt_Dimensions: function(){
                wtconfig.set('ET.Art_Dimensions', this.ArtDim);
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
