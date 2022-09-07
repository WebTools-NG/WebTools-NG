// TMDB stuff used
//import store from '../../../store';
//import { wtconfig } from './wtutils';
import axios from 'axios';
import { wtutils } from './wtutils';

const log = require('electron-log');
const {JSONPath} = require('jsonpath-plus');



const tmdb = new class TMDB {
    constructor() {
        this.baseUrl = 'https://www.themoviedb.org/';
        this.baseAPIUrl = 'https://api.themoviedb.org';
    }

    get tmdbHeader(){
        var headers = {
            "Accept": "application/json",
            "X-Plex-Product": this.AppName,
            "X-Plex-Version": this.AppVersion,
            "X-Plex-Device": this.Platform
        }
        return headers
    }

    async getTMDBShowInfo( tmdbId ){
        log.info(`[tmdb.js] (getTMDBShowInfo) - Getting tmdb info for ${tmdbId}`);
        let url = `${this.baseAPIUrl}/3/tv/${tmdbId}?language=en-US`
        let header = {
            "Accept": "application/json"
        };
        log.info(`[tmdb.js] (getTMDBShowInfo) - Url is ${url}`)
        const apiKey = wtutils.envVarLocal( 'Key_tmdb' );
        url = `${url}&api_key=${apiKey}`;
        const result = {};
        await axios({
            method: 'get',
            url: url,
            headers: header
          })
            .then((response) => {
              log.debug('[tmdb.js] (getTMDBShowInfo) - Response from getTMDBShowInfo recieved');
              result['TMDBStatus'] = JSONPath({ path: "$.status", json: response.data })[0];
              result['TMDBEPCount'] = JSONPath({ path: "$.number_of_episodes", json: response.data })[0];
              result['TMDBSCount'] = JSONPath({ path: "$.number_of_seasons", json: response.data })[0];
              result['TMDBSeasons'] = {};
              const arrSeasons = JSONPath({ path: "$.seasons", json: response.data })[0];
              for (const season of arrSeasons) {
                const season_number = JSONPath({ path: "$.season_number", json: season })[0];
                result['seasons'][season_number] = JSONPath({ path: "$.episode_count", json: season });
              }
            })
            .catch(function (error) {
              if (error.response) {
                  log.error('getTMDBShowInfo: ' + error.response.data);
                  alert(error.response.data.errors[0].code + " " + error.response.data.errors[0].message);
              } else if (error.request) {
                  log.error('getTMDBShowInfo: ' + error.request);
              } else {
                  log.error('getTMDBShowInfo: ' + error.message);
              }
            })
        log.silly(`[tmdb.js] (getTMDBShowInfo) - Returning: ${JSON.stringify(result)}`)
        return result;
    }
}

export { tmdb };