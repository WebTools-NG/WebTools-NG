const log = require('electron-log');
import axios from 'axios'

const ptv = new class PTV {
    constructor() {                    
    }

    checkServerConnect(server) {
        log.info("NUGGA : ET : checkServerConnect called")
        server.connections.forEach((val) => {
            log.info(val.uri)
            let baseurl = val.uri

                axios.get(baseurl + '/identity')
                .then(response => {
                    log.info(response)
                    if(response.status == 200){
                        log.info("NUGGA: PTV : checkServerConnect: response status is 200")
                        
                    }
                  }).catch((error) => {
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
          )
       let serverAdress = []

        return serverAdress
    }

}
export {ptv};