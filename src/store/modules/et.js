import axios from 'axios';


const state = {
    sections:   [],
    selectedSection : ""
};

const mutations = {
    UPDATE_SECTIONS(state, payload) {
        state.sections = payload;
      },
      UPDATE_SELECTEDSECTION(state, payload) {
          state.selectedSection = payload
      }
};

const actions = {
    fetchSections({ commit, getters }) {
        var baseURL = getters.getSlectedServerAddress

        axios({
            method: 'get',
            baseURL: `http://${baseURL}`,
            url: '/library/sections/all',
            responseType: 'json',
            headers: {
                'Accept':       "application/json",
                'X-Plex-Token': getters.getAuthToken
            }
        }).then((response) => {
            console.log("fetchSection is status " + response.status)
            commit('UPDATE_SECTIONS', response.data.MediaContainer.Directory)

        }
        ).catch((error) => {
                if (error.response) {                  
                    // The request was made and tgite server responded with a status code
                    // that falls out of the range of 2xx
                    console.log(error.response.data)
                    console.log(error.response.status)
                    alert(error.response.data.error)
                    //this.danger(error.response.status, error.response.data.error);
                } else if (error.request) {
                    // The request was made but no response was received
                    // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
                    // http.ClientRequest in node.js
                    console.log(error.request);
                } else {
                    // Something happened in setting up the request that triggered an Error
                    console.log('Error', error.message);
                }
            }
        )
    },
    getMedia({ getters }) {

        var key = getters.getSelectedSection

        axios({
            method: 'get',
            url: `http://127.0.0.1:32400/library/sections/${key}/all`,
            responseType: 'json',
            headers: {
                'Accept':       "application/json",
                'X-Plex-Token': getters.getAuthToken
            },
            params: {
                "type": "1",
                "X-Plex-Container-Start": "0",
                "X-Plex-Container-Size": getters.getContainerSizeMovies
            }
        }).then((response) => {
            

            console.log("getMedia is status " + response.status)
            console.log(response.data)
            console.log(response.data.MediaContainer.Metadata)
            //commit('UPDATE_SECTIONS', response.data.MediaContainer.Metadata)
            
        }
        ).catch((error) => {
                if (error.response) {                  
                    // The request was made and tgite server responded with a status code
                    // that falls out of the range of 2xx
                    console.log(error.response.data)
                    console.log(error.response.status)
                    alert(error.response.data.error)
                    //this.danger(error.response.status, error.response.data.error);
                } else if (error.request) {
                    // The request was made but no response was received
                    // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
                    // http.ClientRequest in node.js
                    console.log(error.request);
                } else {
                    // Something happened in setting up the request that triggered an Error
                    console.log('Error', error.message);
                }
            }
        )
    }
}

const getters = {
    getPmsSections: state => state.sections,
    getSelectedSection: state => state.selectedSection
};

const etModule = {
  state,
  mutations,
  actions,
  getters
}

export default etModule;