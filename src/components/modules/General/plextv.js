const log = require('electron-log');
import axios from 'axios'
import store from '../../../store';


const ptv = new class PTV {
    constructor() {
    }
    async checkServerConnect(server) {
        log.verbose(`[plextv.js] (checkServerConnect) Checking address for server: ${server.name}`);
        // Set WaitState
        store.commit("UPDATE_PLEX_SELECTED_SERVER_STATUS", true);
        let PMSAddress = '';
        let local = false;
        // Start with the local address check first
        for (var i = 0; i < server.connections.length; i++) {
            let val = server.connections[i];
            log.verbose(`[plextv.js] (checkServerConnect) Checking: ${val.protocol}://${val.address}:${val.port}`);
            let baseurl = val.protocol + '://' + val.address + ':' + val.port;
            await axios.get(baseurl + '/identity', {
                headers: {
                    Accept: 'application/json'
                },
                timeout: 5000
                })
                .then(response => {
                    if(response.status == 200){
                        log.verbose(`[plextv.js] (checkServerConnect) Address ${baseurl} is alive, so check if local`);
                        if ( val.local == true){
                            log.verbose(`[plextv.js] (checkServerConnect) It's a local server, so need to check if correct one`);
                            const machineIdentifier = response.data['MediaContainer']['machineIdentifier'];
                            if (machineIdentifier == server.clientIdentifier){
                                log.verbose(`[plextv.js] (checkServerConnect) Local server found as: ${baseurl}`);
                                PMSAddress = baseurl;
                                local = true;
                            }
                        }
                        else
                        {
                            // only if we didn't find the local one?
                            if ( local == false)
                            {
                                log.verbose(`[plextv.js] (checkServerConnect) No local server found yet, so checking ${baseurl}`)
                                const machineIdentifier = response.data['MediaContainer']['machineIdentifier'];
                                if (machineIdentifier == server.clientIdentifier){
                                    log.verbose(`[plextv.js] (checkServerConnect) Remote server found as: ${baseurl}`);
                                    PMSAddress = baseurl;
                                }
                            }
                        }
                    }
                    }).catch((error) => {
                    if (error.response) {
                        // The request was made and server responded with a status code
                        // that falls out of the range of 2xx
                        log.warn(`[plextv.js] (checkServerConnect) ${error.response.status}`)
                    } else if (error.request) {
                        // The request was made but no response was received
                        log.warn(`[plextv.js] (checkServerConnect) No response recieved`);
                    }
                        else {
                        // Something happened in setting up the request that triggered an Error
                        log.warn(`[plextv.js] (checkServerConnect) ${error.message}`);
                    }
                }
            )
        }
        log.info(`[plextv.js] (checkServerConnect)Returning valid address as: ${PMSAddress}`)
        store.commit("UPDATE_SELECTED_SERVER_ADDRESS", PMSAddress);
        store.commit("UPDATE_PLEX_SELECTED_SERVER_STATUS", false);
        return PMSAddress
    }
}
export {ptv};