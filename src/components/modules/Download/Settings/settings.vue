<template>
  <b-container class="m-2 mt-2">
    <div>   <!-- Title and desc -->
      <h2>
        {{ $t(`Modules.Download.Settings.Name`) }}
      </h2>
      <h5>{{ $t(`Modules.Download.Settings.Description`) }}</h5>
    </div>
    <br>
    <b-form-group id="downloadMaxBandWidth" v-bind:label="$t('Modules.Download.Settings.DownloadMaxBandWidth')" label-size="lg" label-class="font-weight-bold pt-0">
        <b-form-select
            class="form-control"
            v-model="SelectedMoviesID"
            id="SelectedMoviesID"
            :options="SelectedMoviesIDOptions"
            @change="SelectedMoviesIDChanged"
            style="width: 50%"
            name="SugMovieID">
        </b-form-select>
        <WTNGtt tt="Modules.ET.Settings.ttMoviesUseId" size="20px"></WTNGtt>
    </b-form-group>
    <!-- Buttons -->
    <div class="buttons">
        <!-- Buttons -->
        <div id="buttons" class="text-center">
            <b-button-group >
                <b-button variant="success" class="mr-1" @click="Return"> {{ $t('Modules.Download.Settings.Return') }} </b-button>
            </b-button-group>
        </div>
    </div>
  </b-container>
</template>

<script>
    const log = require("electron-log");
    import {wtutils, wtconfig, dialog} from '../../General/wtutils';
    import WTNGtt from '../../General/wtng-tt.vue'
    log, wtutils, wtconfig, dialog
    import i18n from '../../../../i18n'
    i18n
    export default {
        components: {
            WTNGtt
        },
        created() {
            this.getDefaults();
        },
        data() {
            return {
                PosterDimDisabled: false,
                ArtDimDisabled: false,
                PosterDim: wtconfig.get('ET.Posters_Dimensions', '75*75'),
                ArtDim: wtconfig.get('ET.Art_Dimensions', '75*75'),
                SelectedMoviesIDOptions: ['imdb', 'tmdb'],
                SelectedMoviesID: '',
                SelectedShowsIDOptions: ['tmdb', 'tvdb'],
                SelectedShowsID: ''
            };
        },
        methods: {
            // Return to ET
            Return(){
                this.$router.push({ name: 'download' })
            },
            

            SelectedMoviesIDChanged(){
                wtconfig.set("ET.SelectedMoviesID", this.SelectedMoviesID);
            },

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
    #qmark2222{
        margin-left:10px;
    }
    i.ttqmark{
        margin-left:10px;
    }

</style>
