<template>
  <b-container class="m-2 mt-2">
    <div>   <!-- Title and desc -->
      <h2>
        {{ $t(`Common.Settings.PMS.Name`) }}
      </h2>
      <h5>{{ $t(`Common.Settings.PMS.Description`) }}</h5>
    </div>
    <br>
    <b-input-group id="TimeOutGrp" :prepend="$t('Modules.GlobalSettings.TimeOut')" class="mt-3">
      <b-form-input id="TimeOut" name="TimeOut" type="text" class="form-control" v-model="TimeOut" :disabled=false :maxlength=2 @change="setTimeOut()"></b-form-input>
    </b-input-group>
    <b-input-group id="ContainerSizeMovie" :prepend="$t('Modules.GlobalSettings.ContainerSizeMovie')" class="mt-3">
      <b-form-select id="ContainerSizeMovie" name="ContainerSizeMovie" type="text" class="form-control" v-model="ContainerSizeMovie" :options="ContainerSizes" :disabled=false v-on:change="setPrefs($event, 'PMS.ContainerSize.1')"></b-form-select>
      <WTNGtt tt="Modules.GlobalSettings.TTContainerSize" size="20px"></WTNGtt>
    </b-input-group>
    <b-input-group id="ContainerSizeShow" :prepend="$t('Modules.GlobalSettings.ContainerSizeShow')" class="mt-3">
      <b-form-select id="ContainerSizeShow" name="ContainerSizeShow" type="text" class="form-control" v-model="ContainerSizeShow" :options="ContainerSizes" :disabled=false v-on:change="setPrefs($event, 'PMS.ContainerSize.2')"></b-form-select>
      <WTNGtt tt="Modules.GlobalSettings.TTContainerSize" size="20px"></WTNGtt>
    </b-input-group>
    <b-input-group id="ContainerSizeEpisode" :prepend="$t('Modules.GlobalSettings.ContainerSizeEpisode')" class="mt-3">
      <b-form-select id="ContainerSizeEpisode" name="ContainerSizeEpisode" type="text" class="form-control" v-model="ContainerSizeEpisode" :options="ContainerSizes" :disabled=false v-on:change="setPrefs($event, 'PMS.ContainerSize.4')"></b-form-select>
      <WTNGtt tt="Modules.GlobalSettings.TTContainerSize" size="20px"></WTNGtt>
    </b-input-group>
    <b-input-group id="ContainerSizeArtist" :prepend="$t('Modules.GlobalSettings.ContainerSizeArtist')" class="mt-3">
      <b-form-select id="ContainerSizeArtist" name="ContainerSizeArtist" type="text" class="form-control" v-model="ContainerSizeArtist" :options="ContainerSizes" :disabled=false v-on:change="setPrefs($event, 'PMS.ContainerSize.8')"></b-form-select>
      <WTNGtt tt="Modules.GlobalSettings.TTContainerSize" size="20px"></WTNGtt>
    </b-input-group>
    <b-input-group id="ContainerSizeAlbum" :prepend="$t('Modules.GlobalSettings.ContainerSizeAlbum')" class="mt-3">
      <b-form-select id="ContainerSizeAlbum" name="ContainerSizeAlbum" type="text" class="form-control" v-model="ContainerSizeAlbum" :options="ContainerSizes" :disabled=false v-on:change="setPrefs($event, 'PMS.ContainerSize.9')"></b-form-select>
      <WTNGtt tt="Modules.GlobalSettings.TTContainerSize" size="20px"></WTNGtt>
    </b-input-group>
    <b-input-group id="ContainerSizeTrack" :prepend="$t('Modules.GlobalSettings.ContainerSizeTrack')" class="mt-3">
      <b-form-select id="ContainerSizeTrack" name="ContainerSizeTrack" type="text" class="form-control" v-model="ContainerSizeTrack" :options="ContainerSizes" :disabled=false v-on:change="setPrefs($event, 'PMS.ContainerSize.10')"></b-form-select>
      <WTNGtt tt="Modules.GlobalSettings.TTContainerSize" size="20px"></WTNGtt>
    </b-input-group>
    <b-input-group id="ContainerSizePhoto" :prepend="$t('Modules.GlobalSettings.ContainerSizePhoto')" class="mt-3">
      <b-form-select id="ContainerSizePhoto" name="ContainerSizePhoto" type="text" class="form-control" v-model="ContainerSizePhoto" :options="ContainerSizes" :disabled=false v-on:change="setPrefs($event, 'PMS.ContainerSize.13')"></b-form-select>
      <WTNGtt tt="Modules.GlobalSettings.TTContainerSize" size="20px"></WTNGtt>
    </b-input-group>
    <b-input-group id="ContainerSizePlaylist" :prepend="$t('Modules.GlobalSettings.ContainerSizePlaylist')" class="mt-3">
      <b-form-select id="ContainerSizePlaylist" name="ContainerSizePlaylist" type="text" class="form-control" v-model="ContainerSizePlaylist" :options="ContainerSizes" :disabled=false v-on:change="setPrefs($event, 'PMS.ContainerSize.15')"></b-form-select>
      <WTNGtt tt="Modules.GlobalSettings.TTContainerSize" size="20px"></WTNGtt>
    </b-input-group>
    <b-input-group id="ContainerSizeLibraries" :prepend="$t('Modules.GlobalSettings.ContainerSizeLibraries')" class="mt-3">
      <b-form-select id="ContainerSizeLibraries" name="ContainerSizeLibraries" type="text" class="form-control" v-model="ContainerSizeLibraries" :options="ContainerSizes" :disabled=false v-on:change="setPrefs($event, 'PMS.ContainerSize.1002')"></b-form-select>
      <WTNGtt tt="Modules.GlobalSettings.TTContainerSize" size="20px"></WTNGtt>
    </b-input-group>
    <b-input-group id="ContainerSizePlaylists" :prepend="$t('Modules.GlobalSettings.ContainerSizePlaylists')" class="mt-3">
      <b-form-select id="ContainerSizePlaylists" name="ContainerSizePlaylists" type="text" class="form-control" v-model="ContainerSizePlaylists" :options="ContainerSizes" :disabled=false v-on:change="setPrefs($event, 'PMS.ContainerSize.3001')"></b-form-select>
      <WTNGtt tt="Modules.GlobalSettings.TTContainerSize" size="20px"></WTNGtt>
    </b-input-group>

    <br>
    <!-- Buttons -->
    <div class="buttons">
        <!-- Buttons -->
        <div id="buttons" class="text-center">
            <b-button-group >
                <b-button variant="success" class="mr-1" @click="jumpToSettings"> {{ $t('Common.Settings.Return') }} </b-button>
            </b-button-group>
        </div>
    </div>
    <br>
  </b-container>
</template>

<script>
  import { wtconfig } from '../../General/wtutils';
  import WTNGtt from '../../General/wtng-tt.vue'
  const log = require("electron-log");
  export default {
    components: {
            WTNGtt
        },
    data() {
      return {
        ContainerSizeMovie: wtconfig.get('PMS.ContainerSize.1'),
        ContainerSizeShow: wtconfig.get('PMS.ContainerSize.2'),
        ContainerSizeEpisode: wtconfig.get('PMS.ContainerSize.4'),
        ContainerSizeArtist: wtconfig.get('PMS.ContainerSize.8'),
        ContainerSizeAlbum: wtconfig.get('PMS.ContainerSize.9'),
        ContainerSizeTrack: wtconfig.get('PMS.ContainerSize.10'),
        ContainerSizePhoto: wtconfig.get('PMS.ContainerSize.13'),
        ContainerSizePlaylist: wtconfig.get('PMS.ContainerSize.15'),
        ContainerSizeLibraries: wtconfig.get('PMS.ContainerSize.1002'),
        ContainerSizePlaylists: wtconfig.get('PMS.ContainerSize.3001'),
        TimeOut: wtconfig.get('PMS.TimeOut', 20)

      };
    },
    created() {
      log.info(`[SettingsPMS.vue] (created) - SettingsPMS Created`);
    },
    computed: {
      ContainerSizes: function() {
        const options = [20, 30, 40, 50, 60, 70, 80, 90, 100];
        return options;
      }
    },
    methods: {
      setTimeOut: function(){
        wtconfig.set('PMS.TimeOut', this.TimeOut)
      },
      // Update conf file
      setPrefs: function(value, name){
        log.info(`[SettingsPMS.vue] (setPrefs) - Update prefs for ${name} set to ${value}`);
        wtconfig.set(name, value);
      },
      // Return to main Settings
      jumpToSettings(){
          this.$router.push({ name: 'settingsGlobal' })
      }
    }
  }

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
#sync-button {
  margin-left: 1em;
}
</style>
