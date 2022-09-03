<template>
  <b-container class="m-2 mt-2">
    <div>   <!-- Title and desc -->
      <h2>
        {{ $t(`Modules.About.Name`) }}
      </h2>
      <h5>{{ $t(`Modules.About.MainDevelopers`) }}</h5>
      <p>
        * {{ $t("Modules.About.Devdane22") }} <br>
        * {{ $t("Modules.About.DevCPSO") }}
      </p>
      <h5>{{ $t("Modules.About.WikiDevelopers") }}</h5>
      <p>
        * {{ $t("Modules.About.Wikitrumpy81") }}
      </p>
      <h5>
        {{ $t("Modules.About.TranslationBetaTestersTitle") }} <br>
        <small>{{ $t("Modules.About.TranslationBetaTestersText") }}</small>
      </h5>
      <div>
        <ul class="list-inline">
            <li class="list-inline-item" v-for="(po, index) in poeTranslators" :key="po.name">{{ po.name }}<span v-if="index != (poeTranslators.length - 1)">,</span></li>
        </ul>
      </div>
      <h5>{{ $t(`Modules.About.Credits`) }}</h5>
      <div>
        <div>
          <b-img src="https://raw.githubusercontent.com/WebTools-NG/WebTools-NG/master/wiki/icons/Plex_logo_2022-03.png" rounded="square" alt="tmdb logo" width="75" class="makeSpaceRight hand" v-on:click="jumptoPlex"></b-img>
        </div>
        {{ $t("Modules.About.Plex-Credit") }} {{ $t("Modules.About.PMS-Download") }}
        <b-link id="signupTrans" @click.native="jumptoPlexPMSDwn">{{ $t("Modules.About.API-SignupHere") }}</b-link>
      </div>
      <br>
      <div>
        <div>
          <b-img src="https://raw.githubusercontent.com/WebTools-NG/WebTools-NG/master/wiki/icons/poeditor.png" rounded="square" alt="tmdb logo" width="75" class="makeSpaceRight hand" v-on:click="jumptoPOE"></b-img>
        </div>
        {{ $t("Modules.About.POE-Credit") }} {{ $t("Modules.About.POE-SignUp") }}
        <b-link id="signupTrans" @click.native="jumptoPOESignUp">{{ $t("Modules.About.API-SignupHere") }}</b-link>
      </div>
      <br>
      <div>
        <div>
          <b-img src="https://raw.githubusercontent.com/WebTools-NG/WebTools-NG/master/wiki/icons/TMDB-Full.png" rounded="square" alt="tmdb logo" width="75" class="makeSpaceRight hand" v-on:click="jumptoTMDB"></b-img>
        </div>
        {{ $t("Modules.About.API-Credit", ["TMDB"]) }} {{ $t("Modules.About.API-SignUp") }}
        <b-link id="signupTMDB" @click.native="jumptoTMDBSignUp">{{ $t("Modules.About.API-SignupHere") }}</b-link>
      </div>
      <br>
      <div>
        <div>
          <b-img src="https://raw.githubusercontent.com/WebTools-NG/WebTools-NG/master/wiki/icons/TVDB%20Logo.png" rounded="square" alt="TVDB logo" width="75" class="makeSpaceRight hand" v-on:click="jumptoTVDB"></b-img>
        </div>
        {{ $t("Modules.About.API-Credit", ["TheTVDB"]) }} {{ $t("Modules.About.API-SignUp") }}
        <b-link id="signupTVDB" @click.native="jumptoTVDBSignUp">{{ $t("Modules.About.API-SignupHere") }}</b-link>
      </div>
    </div>
  </b-container>
</template>

<script>
const log = require('electron-log');

import { shell } from 'electron';





console.log = log.log;
export default {
  data() {
    return {
      poeTranslators: []
    }
  },
  async created() {
    await this.$store.dispatch('fetchPOEContrib');
    this.poeTranslators = await this.$store.getters.getContrib;
  },
  mounted() {
    log.info(`[About.vue] (mounted) - About Created`);
  },
  methods: {
    jumptoTMDBSignUp() {
      shell.openExternal("https://www.themoviedb.org/signup");
    },
    jumptoTMDB() {
      shell.openExternal("https://www.themoviedb.org/");
    },
    jumptoTVDBSignUp() {
      shell.openExternal("https://thetvdb.com/subscribe/");
    },
    jumptoTVDB() {
      shell.openExternal("https://thetvdb.com/");
    },
    jumptoPOE() {
      shell.openExternal("https://poeditor.com/");
    },
    jumptoPOESignUp() {
      shell.openExternal("https://poeditor.com/join/project?hash=yFjdfkDfup");
    },
    jumptoPlex() {
      shell.openExternal("https://plex.tv");
    },
    jumptoPlexPMSDwn() {
      shell.openExternal("https://www.plex.tv/en-au/media-server-downloads");
    }
  }
}

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .makeSpaceRight{
    padding-right: 5px;
  }
  .makeSpaceLeft{
    padding-right: 15px;
  }
  .hand{
    cursor: pointer;
  }

</style>
