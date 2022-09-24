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
        log.info(`[tmdb.js] (getTMDBShowInfo) - Getting tmdb info for ${tmdbId} with a title of ${title}`);
        let url = `${this.baseAPIUrl}/3/tv/${tmdbId}?language=en-US`
        let header = {
            "Accept": "application/json"
        };
        log.info(`[tmdb.js] (getTMDBShowInfo) - Url is ${url}`)
        const apiKey = wtutils.envVarLocal( 'Key_tmdb' );
        url = `${url}&api_key=${apiKey}`;
        const result = {};
        let Seasons_Cloud = {};
        let totalEpisodes = 0;
        let curSeason = 0;
        let totalSeasonEpisodes = 0;
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
              const nextEpisodeToAir = parseInt(JSONPath({ path: "$..next_episode_to_air.episode_number", json: response.data })[0]);
              const nextSeason = parseInt(JSONPath({ path: "$..next_episode_to_air.season_number", json: response.data })[0]);
              let doAdd = false;
              for ( var idx in seasons ){
                curSeason = parseInt(JSONPath({ path: "$..season_number", json: seasons[idx]})[0]);
                totalSeasonEpisodes = parseInt(JSONPath({ path: "$..episode_count", json: seasons[idx]})[0]);
                // Do we have a special here?
                if ( curSeason == 0)
                {
                    // Is specials allowed?
                    if ( !wtconfig.get('ET.noSpecials' ) ){
                        if ( curSeason == nextSeason) {
                            totalSeasonEpisodes = nextEpisodeToAir -1;
                            doAdd = true;
                        } else {
                            // Not the season with future episodes, so simply add
                            doAdd = true;
                        }
                    }
                } else{
                    if ( nextEpisodeToAir ) {
                        log.debug(`[tmdb.js] (getTMDBShowInfo) - We need to lookout for future episodes past ${nextSeason}:${nextEpisodeToAir -1}`);
                        if ( curSeason == nextSeason) {
                            totalSeasonEpisodes = nextEpisodeToAir -1;
                            doAdd = true;
                        } else {
                            // Not the season with future episodes, so simply add
                            doAdd = true;
                        }
                    } else {
                        // We don't have a future episode, so simply add
                        doAdd = true;
                    }
                }
                if ( doAdd ){
                    log.debug(`[tmdb.js] (getTMDBShowInfo) - Adding ${curSeason}:${totalSeasonEpisodes}`);
                    totalEpisodes = totalEpisodes + totalSeasonEpisodes;
                    Seasons_Cloud[curSeason] = totalSeasonEpisodes;
                }
              }
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
        result['Episode Count (Cloud)'] = totalEpisodes;
        result['Season Count (Cloud)'] = Object.keys(Seasons_Cloud).length;
        result['Seasons (Cloud)'] = Seasons_Cloud;
        log.silly(`[tmdb.js] (getTMDBShowInfo) - Returning: ${JSON.stringify(result)}`);
        return result;
    }
}

export { tmdb };