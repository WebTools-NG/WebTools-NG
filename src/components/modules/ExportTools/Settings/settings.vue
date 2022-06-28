<template>
  <b-container fluid>
    <div class="col-lg-10 col-md-12 col-xs-12">
    <p id="demo"></p>
    <h1>{{ $t("Modules.ET.Settings.Name") }}</h1>
    <p>{{ $t("Modules.ET.Settings.Description") }}</p>
    <b-link id="general" to="/settings/export">{{ $t("Modules.ET.Settings.Note") }} </b-link>
    <br>



    <b-input-group id="PosterGrp" :prepend="$t('Modules.ET.Settings.Posters_Dimensions')" class="mt-3">
        <b-tooltip target="PosterGrp" triggers="hover">
              {{ $t('Modules.ET.Settings.Posters_Dimensions_TT') }}
        </b-tooltip>
        <b-form-input id="PosterDim" name="PosterDim" type="text" class="form-control" v-model="PosterDim" :disabled=false @change="setPosters_Dimensions()"></b-form-input>
    </b-input-group>
    <b-input-group id="ArtGrp" :prepend="$t('Modules.ET.Settings.Art_Dimensions')" class="mt-3">
        <b-tooltip target="ArtGrp" triggers="hover">
              {{ $t('Modules.ET.Settings.Art_Dimensions_TT') }}
        </b-tooltip>
        <b-form-input id="ArtDim" name="ArtDim" type="text" class="form-control" v-model="ArtDim" :disabled=false @change="setArt_Dimensions()"></b-form-input>
    </b-input-group>
    <b-form-group id="b-form-group">
      <b-form-checkbox-group
        stacked
        :options="cbOptions"
        v-model="cbSelected"
        @change.native="filterTable">
      </b-form-checkbox-group>
    </b-form-group>
    <b-form-group id="etSugMovieID" v-bind:label="$t('Modules.ET.Settings.MoviesUseId')" label-size="lg" label-class="font-weight-bold pt-0">
        <b-tooltip target="etSugMovieID" triggers="hover">
            {{ $t('Modules.ET.Settings.ttMoviesUseId') }}
        </b-tooltip>
            <b-form-select
            class="form-control"
            v-model="SelectedMoviesID"
            id="SelectedMoviesID"
            :options="SelectedMoviesIDOptions"
            @change="SelectedMoviesIDChanged"
            name="SugMovieID">
            </b-form-select>
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
            this.getDefaults();
            // alert('For this version, export to XLSX is currently disabled');
            this.showAlert();
        },
        data() {
            return {
                PosterDim: wtconfig.get('ET.Posters_Dimensions', '75*75'),
                ArtDim: wtconfig.get('ET.Art_Dimensions', '75*75'),
                cbSelected: [],
                cbOptions: [
                    { text: i18n.t('Modules.ET.Settings.ExportToCSV'), value: 'ExpCSV' },
                    { text: i18n.t('Modules.ET.Settings.ExportToExcel'), value: 'ExpXLSX', disabled: true },
                    { text: i18n.t('Modules.ET.Settings.OrgTitleNull'), value: 'OrgTitleNull' },
                    { text: i18n.t('Modules.ET.Settings.SortTitleNull'), value: 'SortTitleNull' },
                    { text: i18n.t('Modules.ET.Settings.suggestedFileNoExtra'), value: 'suggestedFileNoExtra' },
                    { text: i18n.t('Modules.ET.Settings.suggestedUseOrigenTitle'), value: 'suggestedUseOrigenTitle' }
                ],
                SelectedMoviesIDOptions: ['imdb', 'tmdb'],
                SelectedMoviesID: '',
                SelectedShowsIDOptions: ['tmdb', 'tvdb'],
                SelectedShowsID: ''
            };
        },
        methods: {
            showAlert(){
                dialog.ShowMsg( i18n.t("Modules.ET.Name"), i18n.t("Common.Ok"), i18n.t("Common.AppName"), 'For this version, export to XLSX is currently disabled', 'info');
            },
            getDefaults(){
                const cbItems = ["ExpCSV","ExpXLSX", "OrgTitleNull", "SortTitleNull", "suggestedFileNoExtra", "suggestedUseOrigenTitle"];
                for(let i = 0; i < cbItems.length; i++){
                    if (wtconfig.get("ET." + cbItems[i], false)){
                        this.cbSelected.push(cbItems[i]);
                    }
                }
                this.SelectedMoviesID = wtconfig.get("ET.SelectedMoviesID", "imdb");
            },
            SelectedMoviesIDChanged(){
                wtconfig.set("ET.SelectedMoviesID", this.SelectedMoviesID);
            },
            filterTable(){
                this.$nextTick(()=>{console.log(this.cbSelected);})
                for( var cbItem of ["ExpCSV","ExpXLSX","OrgTitleNull", "SortTitleNull", "AutoXLSCol", "AutoXLSRow", "suggestedFileNoExtra", "suggestedUseOrigenTitle"]){
                    wtconfig.set("ET." + cbItem, (this.cbSelected.includes(cbItem)))
                }
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
