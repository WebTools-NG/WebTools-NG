// TMDB stuff used
import axios from 'axios';
import {  wtconfig, wtutils } from './wtutils';

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

    async getTMDBShowInfo( { tmdbId: tmdbId, title: title } ){
        log.info(`[tmdb.js] (getTMDBShowInfo) - Getting tmdb info for ${tmdbId} with a titler of ${title}`);
        let url = `${this.baseAPIUrl}/3/tv/${tmdbId}?language=en-US`
        let header = {
            "Accept": "application/json"
        };
        log.info(`[tmdb.js] (getTMDBShowInfo) - Url is ${url}`)
        const apiKey = wtutils.envVarLocal( 'Key_tmdb' );
        url = `${url}&api_key=${apiKey}`;
        const result = {};
        let seasonCount = 0;
        let episodeCount = 0;
        await axios({
            method: 'get',
            url: url,
            headers: header
          })
            .then((response) => {
              log.debug('[tmdb.js] (getTMDBShowInfo) - Response from getTMDBShowInfo recieved');
              result['Status (Cloud)'] = JSONPath({ path: "$.status", json: response.data })[0];
              // Now get season/episode
              const seasons = JSONPath({ path: "$..seasons[*]", json: response.data })
              let nextEpisodeToAir = JSONPath({ path: "$..next_episode_to_air.episode_number", json: response.data })[0];
              let nextSeason = JSONPath({ path: "$..next_episode_to_air.season_number", json: response.data })[0];
              let Seasons_Cloud = {};
              for ( var idx in seasons ){
                if ( JSONPath({ path: "$..season_number", json: seasons[idx]}) == 0) {
                    if ( !wtconfig.get('ET.noSpecials') ){
                        // Is season currently running
                        if ( nextSeason == (parseInt(idx) + 1) ){
                            // Season is currently running
                            if ( nextEpisodeToAir > 0){
                                // First episode has aired
                                log.info(`[tmdb.js] (getTMDBShowInfo) - Some episodes are in the future, so adj.`);
                                Seasons_Cloud[JSONPath({ path: "$..season_number", json: seasons[idx]})] = nextEpisodeToAir -1;
                                seasonCount++;
                                episodeCount = episodeCount + nextEpisodeToAir -1;
                            }
                        } else {
                            Seasons_Cloud[JSONPath({ path: "$..season_number", json: seasons[idx]})] = JSONPath({ path: "$..episode_count", json: seasons[idx]})[0];
                            seasonCount++;
                            episodeCount = episodeCount + JSONPath({ path: "$..episode_count", json: seasons[idx]})[0];
                        }
                    }
                } else {
                    // Is season currently running
                    if ( nextSeason == (parseInt(idx)+1) ){
                        // Season is currently running
                        console.log('Ged 88-3-2 We have a running Season', idx)
                        if ( nextEpisodeToAir > 0){
                            // First episode has aired
                            log.info(`[tmdb.js] (getTMDBShowInfo) - Some episodes are in the future, so adj.`);
                            Seasons_Cloud[JSONPath({ path: "$..season_number", json: seasons[idx]})[0]] = nextEpisodeToAir -1;
                            seasonCount++;
                            episodeCount = episodeCount + nextEpisodeToAir -1;
                        }
                    } else {
                        Seasons_Cloud[JSONPath({ path: "$..season_number", json: seasons[idx]})] = JSONPath({ path: "$..episode_count", json: seasons[idx]})[0];
                        seasonCount++;
                        episodeCount = episodeCount + JSONPath({ path: "$..episode_count", json: seasons[idx]})[0];
                    }
                }
              }
              result['Seasons (Cloud)'] = Seasons_Cloud;
            })
            .catch(function (error) {
              if (error.response) {
                  log.error(`[tmdb.js] (getTMDBShowInfo) - Response error: ${error.response.data}`);
                  alert(error.response.data.errors[0].code + " " + error.response.data.errors[0].message);
                  log.error(`[tmdb.js] (getTMDBShowInfo) - Returning: ${JSON.stringify(result)}`);
                  result['Link (Cloud)'] = '**** ERROR ****';
                  log.error(`[ethelper.js] (addRowToTmp) - tmdb guid problem for ${title}`);
                  return result;
              } else if (error.request) {
                  log.error(`[tmdb.js] (getTMDBShowInfo) - Request Error: ${error.request}`);
                  log.error(`[tmdb.js] (getTMDBShowInfo) - Returning: ${JSON.stringify(result)}`);
                  result['Link (Cloud)'] = '**** ERROR ****';
                  log.error(`[ethelper.js] (addRowToTmp) - tmdb guid problem for ${title}`);
                  return result;
              } else {
                  log.error(`[tmdb.js] (getTMDBShowInfo) - ${error.message}`);
                  log.error(`[tmdb.js] (getTMDBShowInfo) - Returning: ${JSON.stringify(result)}`);
                  result['Link (Cloud)'] = '**** ERROR ****';
                  log.error(`[ethelper.js] (addRowToTmp) - tmdb guid problem for ${title}`);
                  return result;
              }
            })
        result['Episode Count (Cloud)'] = episodeCount;
        result['Season Count (Cloud)'] = seasonCount;
        log.silly(`[tmdb.js] (getTMDBShowInfo) - Returning: ${JSON.stringify(result)}`);
        return result;
    }
}

export { tmdb };