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
    <b-input-group id="TimeOutGrp" :prepend="$t('Modules.ET.Settings.TimeOut')" class="mt-3">
        <b-form-input id="TimeOut" name="TimeOut" type="text" class="form-control" v-model="TimeOut" :disabled=false :maxlength=2 @change="setTimeOut()"></b-form-input>
    </b-input-group>
    <b-input-group id="PosterGrp" :prepend="$t('Modules.ET.Settings.Posters_Dimensions')" class="mt-3">
        <b-tooltip target="PosterGrp" triggers="hover">
              {{ $t('Modules.ET.Settings.Posters_Dimensions_TT') }}
        </b-tooltip>
        <b-form-input id="PosterDim" name="PosterDim" type="text" class="form-control" v-model="PosterDim" :disabled=false @change="setPosters_Dimensions()"></b-form-input>
    </b-input-group>
    <b-input-group id="ArtsGrp" :prepend="$t('Modules.ET.Settings.Arts_Dimensions')" class="mt-3">
        <b-tooltip target="ArtsGrp" triggers="hover">
              {{ $t('Modules.ET.Settings.Arts_Dimensions_TT') }}
        </b-tooltip>
        <b-form-input id="ArtsDim" name="ArtsDim" type="text" class="form-control" v-model="ArtsDim" :disabled=false @change="setArts_Dimensions()"></b-form-input>
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
                ArraySep: wtconfig.get('ET.ArraySep'),
                TextQualifierCSV: wtconfig.get('ET.TextQualifierCSV', '"'),
                NotAvailIndicator: wtconfig.get('ET.NotAvail', 'N/A'),
                ColumnSep: '',
                PosterDim: wtconfig.get('ET.Posters_Dimensions', '75*75'),
                ArtsDim: wtconfig.get('ET.Arts_Dimensions', '75*75'),
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
            setTextQualifierCSV: function(){
                wtconfig.set('ET.TextQualifierCSV', this.TextQualifierCSV)
            },
            setNotAvailIndicator: function(){
                wtconfig.set('ET.NotAvail', this.NotAvailIndicator)
            },
            setTimeOut: function(){
                wtconfig.set('PMS.TimeOut', this.TimeOut)
            },
            setPosters_Dimensions: function(){
                wtconfig.set('ET.Posters_Dimensions', this.PosterDim);
            },
            setArts_Dimensions: function(){
                wtconfig.set('ET.Arts_Dimensions', this.ArtsDim);
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
