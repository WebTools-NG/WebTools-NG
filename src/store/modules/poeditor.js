import axios from 'axios';



const baseUrl = 'https://api.poeditor.com/v2/'
const api_token = '5166c4294ff7fb3a82cbdc82958e850e';
const id = '342617';

let requestBody = {
  id: id,
  api_token: api_token
}

const headers = {
  'Content-Type': 'application/x-www-form-urlencoded'
}

const state = {
    contributors: [],
    languages: []
};

const mutations = {
    UPDATE_CONTRIBUTORS(state, payload) {
        state.contributors = payload;
    },
    UPDATE_LANGUAGES(state, payload) {
      state.languages = payload;
  },
};

const qs = require('querystring')
const actions = {
    async fetchPOEContrib({ commit }) {
          const config = {
            headers: headers
          }
          await axios.post( baseUrl + 'contributors/list', qs.stringify(requestBody), config)
            .then((response) => {
                commit('UPDATE_CONTRIBUTORS', response.data.result.contributors)
              })
              .catch(function (error) {
                if (error.response) {
                    console.log(error.response.data)
                    alert(error.response.data.errors[0].code + " " + error.response.data.errors[0].message)
                } else if (error.request) {
                    console.log(error.request);
                } else {
                    console.log('Error', error.message);
                  }
              });
    },
    async fetchPOELang({ commit }) {
      const config = {
        headers: headers
      }
      try {
        const response = await axios.post(baseUrl +  'languages/list', qs.stringify(requestBody), config)
        await commit('UPDATE_LANGUAGES', response.data.result.languages)
      } catch (error) {
        console.log(error.response.body);
      }
    },
    async forceDownload(state, {langCode}) {
      const fs = require('fs')
      const wtutils = require('../../components/modules/General/wtutils');
      const Path = require('path')
      const path = Path.resolve(wtutils.wtutils.Home, 'locales', langCode + '.json')
      const config = {
        headers: headers
      }
      requestBody['language'] = langCode;
      requestBody['type'] = 'key_value_json';
      const response = await axios.post(baseUrl +  'projects/export', qs.stringify(requestBody), config)
      const link = await response.data.result.url;
      // axios image download with response type "stream"
      const dwnlresp = await axios({
        method: 'GET',
        url: link,
        responseType: 'stream'
      })
      var json = JSON.stringify(dwnlresp.data);
      fs.writeFileSync(path, json);
      // Update lang complete state, if updated
      await this.dispatch("fetchPOELang");
    }
}

const getters = {
  getContrib: state => state.contributors,
  getLanguages: state => state.languages
};

const serverModule = {
  state,
  mutations,
  actions,
  getters
}

export default serverModule;