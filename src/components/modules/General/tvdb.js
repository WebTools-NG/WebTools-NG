// TVDB stuff used
import axios from 'axios';
import {  wtconfig, wtutils } from './wtutils';

const log = require('electron-log');
const {JSONPath} = require('jsonpath-plus');



const tvdb = new class TVDB {
    constructor() {
        this.baseUrl = 'https://thetvdb.com/';
        this.baseAPIUrl = 'https://api4.thetvdb.com/v4/';
        this.headers = {
            "Accept": "application/json"
        }
    }

    async login(){
        log.info(`[tvdb.js] (login) - Logging in to theTVDB`);
        const apiKey = wtutils.envVarLocal( 'Key_tvdb' );
        let payload = { apikey: apiKey };
        let url = `${this.baseAPIUrl}login`;
        let bearer;
        await axios.post( url, payload, {headers: this.headers})
            .then((response) => {
                log.debug('[tvdb.js] (login) - Response recieved');
                bearer = JSONPath({ path: "$..token", json: response })[0];
            })
            .catch(function (error) {
                if (error.response) {
                    log.error(`[tvdb.js] (login) - Response error: ${error.response.data}`);
                    alert(error.response.data.errors[0].code + " " + error.response.data.errors[0].message);
                } else if (error.request) {
                    log.error(`[tvdb.js] (login) - Request Error: ${error.request}`);
                } else {
                    log.error(`[tvdb.js] (login) - ${error.message}`);
                }
              })
        return bearer;
    }

    async getTVDBShow( {tvdbId: tvdbId, bearer: bearer, title: title, order: order} ){
      log.info(`[tvdb.js] (getTVDBShowDVD) - Getting tvdb ${order} info for ${tvdbId} with a title of: ${title}`);
      let url = `${this.baseAPIUrl}series/${tvdbId}/episodes/${order}?page=0`;
      log.debug(`[tvdb.js] (getTVDBShowDVD) - Calling url: ${url}`);
      let headers = this.headers;
      let seasons = {};
      let episodeCount = 0;
      headers["Authorization"] = `Bearer ${bearer}`;
      let result = {};
      await axios({
          method: 'get',
          url: url,
          headers: headers
        })
          .then((response) => {
            log.debug('[tvdb.js] (getTVDBShow) - Response from getTVDBShow recieved. Use silly logging to see the data');
            log.silly(JSON.stringify(response.data))
            result['Link (Cloud)'] = `https://thetvdb.com/series/${JSONPath({ path: "$..slug", json: response.data })[0]}`;
            result['Status (Cloud)'] = JSONPath({ path: "$..status.name", json: response.data })[0];
            // Sadly, the tvdb doesn't have a count field for seasons and episodes, so we need to count each :-(
            let episodes = JSONPath({ path: "$..episodes[*]", json: response.data });
            const nextAired = JSONPath({ path: "$..nextAired", json: response.data })[0];
            let nextEpisodeToAir, nextSeasonToAir;
            if ( nextAired ) {
                const futureEpisode = JSONPath({ path: '$..episodes[?(@.aired=="' + nextAired + '")]"', json: response.data });
                nextEpisodeToAir = parseInt(JSONPath({ path: '$..number', json: futureEpisode })[0]);
                nextSeasonToAir = parseInt(JSONPath({ path: '$..seasonNumber', json: futureEpisode })[0]);
            }
            let doAdd;

            // Gather season/episode info
            for ( var idx in episodes ){
                doAdd = false;
                // Get current season and episode numbers
                const curSeason = JSONPath({ path: "$..seasonNumber", json: episodes[idx] })[0];
                const curEpisode = JSONPath({ path: "$..number", json: episodes[idx] })[0];
                log.debug(`[tvdb.js] (getTVDBShow) - Looking at ${curSeason}:${curEpisode}`);
                // Is this a running season ?
                if ( curSeason == nextSeasonToAir ){
                    log.debug(`[tvdb.js] (getTVDBShow) - We have a running season`);
                    if ( curEpisode < nextEpisodeToAir){
                        // Now check if it's a special
                        if ( curSeason == 0 ){
                            if ( !wtconfig.get('ET.noSpecials') ){
                                log.debug(`[tvdb.js] (getTVDBShow) - We have a special, but that's allowed`);
                                doAdd = true;
                            }
                        } else {
                            doAdd = true;
                        }
                    }
                } else {
                    // Now check if it's a special
                    if ( curSeason == 0 ){
                        if ( !wtconfig.get('ET.noSpecials') ){
                            log.debug(`[tvdb.js] (getTVDBShow) - We have a special, but that's allowed`);
                            doAdd = true;
                        }
                    } else {
                        doAdd = true;
                    }
                }
                if ( doAdd ){
                    log.debug(`[tvdb.js] (getTVDBShow) - Adding ${curSeason}:${curEpisode}`);
                    episodeCount++;
                    if( Object.prototype.hasOwnProperty.call(seasons, curSeason) ){
                        seasons[curSeason] = seasons[curSeason] + 1;
                    } else {
                        seasons[curSeason] = 1;
                    }
                }
            }
            result['Seasons (Cloud)'] = seasons;
          })
          .catch(function (error) {
            if (error.response) {
                log.error(`[tvdb.js] (getTVDBShow) - Response error: ${error.response.data}`);
                alert(error.response.data.errors[0].code + " " + error.response.data.errors[0].message);
                log.error(`[tmdb.js] (getTVDBShow) - Returning: ${JSON.stringify(result)}`);
                result['Link (Cloud)'] = '**** ERROR ****';
                log.error(`[tvdb.js] (getTVDBShow) - tmdb guid problem for ${title}`);
                return result;
            } else if (error.request) {
                log.error(`[tvdb.js] (getTVDBShow) - Request Error: ${error.request}`);
                log.error(`[tmdb.js] (getTVDBShow) - Returning: ${JSON.stringify(result)}`);
                result['Link (Cloud)'] = '**** ERROR ****';
                log.error(`[tvdb.js] (getTVDBShow) - tmdb guid problem for ${title}`);
                return result;
            } else {
                log.error(`[tvdb.js] (getTVDBShow) - ${error.message}`);
                log.error(`[tmdb.js] (getTVDBShow) - Returning: ${JSON.stringify(result)}`);
                result['Link (Cloud)'] = '**** ERROR ****';
                log.error(`[tvdb.js] (getTVDBShow) - tmdb guid problem for ${title}`);
                return result;
            }
          })
          result['Episode Count (Cloud)'] = episodeCount;
          result['Season Count (Cloud)'] = Object.keys(seasons).length;
          log.silly(`[tmdb.js] (getTVDBShowDVD) - Returning: ${JSON.stringify(result)}`);
          return result;
  }

}

export { tvdb };