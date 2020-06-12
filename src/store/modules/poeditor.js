import axios from 'axios';


const state = {
    contributors: [],
};

const mutations = {
    UPDATE_CONTRIBUTORS(state, payload) {
        state.contributors = payload;
    },
};

const qs = require('querystring')
const actions = {
    fetchPOEContrib({ commit }) {
        const requestBody = {
            id: '342617',
            api_token: '5166c4294ff7fb3a82cbdc82958e850e'
          } 
          
          const config = {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            }
          }
          
          axios.post('https://api.poeditor.com/v2/contributors/list', qs.stringify(requestBody), config)
            .then((response) => {                
                console.log(response)
                commit('UPDATE_CONTRIBUTORS', response)
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
    }
}

const getters = {
};

const serverModule = {
  state,
  mutations,
  actions,
  getters
}

export default serverModule;