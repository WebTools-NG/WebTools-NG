const log = require('electron-log');
import axios from 'axios'
import store from '../../../store';

const ptv = new class PTV {
    constructor() {                    
    }

    checkServerConnect(server) {
        log.info("NUGGA : ET : checkServerConnect called")
        server.connections.forEach((val) => {
            log.info(val.uri)
            let baseurl = val.uri
                axios.get(baseurl + '/identity', {
                    timeout: 5000
                })
                .then(response => {
                    log.info(response)
                    if(response.status == 200){
                        log.info("NUGGA: PTV : checkServerConnect: response status is 200")
                        log.info("NUGGA : PLT : address for 200 server: " + baseurl)
                        store.commit("UPDATE_SELECTED_SERVER_ADDRESS", baseurl);
                    }
                  }).catch((error) => {
                    if (error.response) {                  
                        // The request was made and tgite server responded with a status code
                        // that falls out of the range of 2xx
                        log.warn(error.response.data)
                        log.warn(error.response.status)
                        alert(error.response.data.error)
                        //this.danger(error.response.status, error.response.data.error);
                    } else if (error.request) {
                        // The request was made but no response was received
                        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
                        // http.ClientRequest in node.js
                        log.warn(error.request);
                    }
                     else {
                        // Something happened in setting up the request that triggered an Error
                        log.warn('Error', error.message);
                    }
                    log.error(error);
                }
            )
            }
          )
       let serverAdress = []

        return serverAdress
    }

}
export {ptv};