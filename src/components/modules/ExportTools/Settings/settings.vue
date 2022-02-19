<template>
  <b-container fluid>
    <div class="col-lg-10 col-md-12 col-xs-12">
    <h1>{{ $t("Modules.ET.Settings.Settings") }}</h1>
    <p>{{ $t("Modules.ET.Settings.Description") }}</p>
    <b-input-group id="ArraySepGrp" :prepend="$t('Modules.ET.Settings.ArraySep')" class="mt-3">
        <b-form-input id="ArraySep" name="ArraySep" type="text" class="form-control" v-model="ArraySep" :disabled=false :maxlength=1 @change="setArraySep()"></b-form-input>
    </b-input-group>
    <b-input-group id="setTextQualifierCSVGrp" :prepend="$t('Modules.ET.Settings.QualifierCSV')" class="mt-3">
        <b-form-input id="TextQualifierCSV" name="TextQualifierCSV" type="text" class="form-control" v-model="TextQualifierCSV" :disabled=false :maxlength=1 @change="setTextQualifierCSV()"></b-form-input>
    </b-input-group>
    <b-input-group id="NotAvailIndicatorGrp" :prepend="$t('Modules.ET.Settings.NotAvailIndicator')" class="mt-3">
        <b-form-input id="NotAvailIndicator" name="NotAvailIndicator" type="text" class="form-control" v-model="NotAvailIndicator" :disabled=false @change="setNotAvailIndicator()"></b-form-input>
    </b-input-group>
    <b-input-group id="ColumnSepGrp" :prepend="$t('Modules.ET.Settings.ColumnSep')" class="mt-3">
        <b-form-input id="ColumnSep" name="ColumnSep" type="text" class="form-control" v-model="ColumnSep" :disabled=false :maxlength=1 @change="setColumnSep"></b-form-input>
    </b-input-group>
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
    <b-input-group id="ChReturn" :prepend="$t('Modules.ET.Settings.ChReturn')" class="mt-3">
        <b-tooltip target="ChReturn" triggers="hover">
              {{ $t('Modules.ET.Settings.ChReturn_TT') }}
        </b-tooltip>
        <b-form-input id="ChReturn" name="ChReturn" type="text" class="form-control" v-model="ChReturn" :disabled=false @change="setChReturn()"></b-form-input>
    </b-input-group>
    <b-input-group id="ChNewLine" :prepend="$t('Modules.ET.Settings.ChNewLine')" class="mt-3">
        <b-tooltip target="ChNewLine" triggers="hover">
              {{ $t('Modules.ET.Settings.ChNewLine_TT') }}
        </b-tooltip>
        <b-form-input id="ChNewLine" name="ChNewLine" type="text" class="form-control" v-model="ChNewLine" :disabled=false @change="setChNewLine()"></b-form-input>
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
            if (wtconfig.get('ET.ColumnSep') == '\t')
            {
                this.ColumnSep = '{TAB}';
            }
            else
            {
                this.ColumnSep = wtconfig.get('ET.ColumnSep');
            }
            alert('For this version, export to XLSX is currently disabled');
        },
        data() {
            return {
                ArraySep: wtconfig.get('ET.ArraySep'),
                TextQualifierCSV: wtconfig.get('ET.TextQualifierCSV', '"'),
                NotAvailIndicator: wtconfig.get('ET.NotAvail', 'N/A'),
                ColumnSep: '',
                PosterDim: wtconfig.get('ET.Posters_Dimensions', '75*75'),
                ArtDim: wtconfig.get('ET.Art_Dimensions', '75*75'),
                cbSelected: [],
                cbOptions: [
                    { text: i18n.t('Modules.ET.Settings.ExportToCSV'), value: 'ExpCSV' },
                    { text: i18n.t('Modules.ET.Settings.ExportToExcel'), value: 'ExpXLSX', disabled: true },
                    { text: i18n.t('Modules.ET.Settings.OrgTitleNull'), value: 'OrgTitleNull' },
                    { text: i18n.t('Modules.ET.Settings.SortTitleNull'), value: 'SortTitleNull' }
                ],
                ChReturn: wtconfig.get('ET.ChReturn', '<RETURN>'),
                ChNewLine: wtconfig.get('ET.ChNewLine', '<NEWLINE>'),
                SelectedMoviesIDOptions: ['imdb', 'tmdb'],
                SelectedMoviesID: '',
                SelectedShowsIDOptions: ['tmdb', 'tvdb'],
                SelectedShowsID: ''

            };
        },
        methods: {
            getDefaults(){
                const cbItems = ["ExpCSV","ExpXLSX", "OrgTitleNull", "SortTitleNull"];
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
                for( var cbItem of ["ExpCSV","ExpXLSX","OrgTitleNull", "SortTitleNull", "AutoXLSCol", "AutoXLSRow"]){
                    wtconfig.set("ET." + cbItem, (this.cbSelected.includes(cbItem)))
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
            setChReturn: function(){
                wtconfig.set('ET.ChReturn', this.ChReturn)
            },
            setChNewLine: function(){
                wtconfig.set('ET.ChNewLine', this.ChNewLine)
            },
            setTextQualifierCSV: function(){
                wtconfig.set('ET.TextQualifierCSV', this.TextQualifierCSV)
            },
            setNotAvailIndicator: function(){
                wtconfig.set('ET.NotAvail', this.NotAvailIndicator)
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
