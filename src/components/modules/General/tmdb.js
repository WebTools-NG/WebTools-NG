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
              result['Status (Cloud)'] = JSONPath({ path: "$.status", json: response.data })[0];
              result['Episode Count (Cloud)'] = JSONPath({ path: "$.number_of_episodes", json: response.data })[0];
              result['Season Count (Cloud)'] = JSONPath({ path: "$.number_of_seasons", json: response.data })[0];
              // Now get season/episode
              const seasons = JSONPath({ path: "$..seasons[*]", json: response.data })
              let Seasons_Cloud = {};
              for ( var idx in seasons ){
                Seasons_Cloud[JSONPath({ path: "$..season_number", json: seasons[idx]})] = JSONPath({ path: "$..episode_count", json: seasons[idx]})[0];
              }
              result['Seasons (Cloud)'] = Seasons_Cloud;
            })
            .catch(function (error) {
              if (error.response) {
                  log.error(`[tmdb.js] (getTMDBShowInfo) - Response error: ${error.response.data}`);
                  alert(error.response.data.errors[0].code + " " + error.response.data.errors[0].message);
              } else if (error.request) {
                  log.error(`[tmdb.js] (getTMDBShowInfo) - Request Error: ${error.request}`);
              } else {
                  log.error(`[tmdb.js] (getTMDBShowInfo) - ${error.message}`);
              }
            })
        log.silly(`[tmdb.js] (getTMDBShowInfo) - Returning: ${JSON.stringify(result)}`)
        return result;
    }
}

export { tmdb };