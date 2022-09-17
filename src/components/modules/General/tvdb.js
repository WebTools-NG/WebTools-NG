// TVDB stuff used
//import store from '../../../store';
//import { wtconfig } from './wtutils';
import axios from 'axios';
import { wtutils } from './wtutils';

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
      log.info(`[tvdb.js] (getTVDBShowDVD) - Getting tmdb ${order} info for ${tvdbId}`);
      let url = `${this.baseAPIUrl}series/${tvdbId}/episodes/${order}?page=0`;
      let headers = this.headers;
      let seasons = {};
      headers["Authorization"] = `Bearer ${bearer}`;
      let result = {};
      await axios({
          method: 'get',
          url: url,
          headers: headers
        })
          .then((response) => {
            log.debug('[tvdb.js] (getTVDBShow) - Response from getTVDBShow recieved');
            result['Link (Cloud)'] = `https://thetvdb.com/series/${JSONPath({ path: "$..slug", json: response.data })[0]}`;
            result['Status (Cloud)'] = JSONPath({ path: "$..status.name", json: response.data })[0];
            // Sadly, the tvdb doesn't have a count field for seasons and episodes, so we need to count each :-(
            let episodes = JSONPath({ path: "$..episodes[*]", json: response.data });
            // Gather season/episode info
            for ( var idx in episodes ){
              const season = JSONPath({ path: "$..seasonNumber", json: episodes[idx] })[0];
              if( Object.prototype.hasOwnProperty.call(seasons, season) ){
                  seasons[season] = seasons[season] + 1;
              } else {
                  seasons[season] = 1;
              }
            }
            // Get Season Count
            result['Season Count (Cloud)'] = Object.keys(seasons).length;
            // Get episode count
            let episodeCount = 0;
            Object.entries(seasons).forEach(([key, value]) => {
              episodeCount = episodeCount + parseInt(value);
              key;
            })
            result['Episode Count (Cloud)'] = episodeCount;
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
          log.silly(`[tmdb.js] (getTVDBShowDVD) - Returning: ${JSON.stringify(result)}`);
          return result;
  }

}

export { tvdb };