const log = require('electron-log');
import axios from 'axios'
import store from '../../../store';
import { wtutils, wtconfig } from '../General/wtutils';


const ptv = new class PTV {
    constructor() {
    }
    async checkServerOptions(server) {
        log.verbose(`[plextv.js] (checkServerOptions) - Checking address for server: ${server.name}`);
        let PMSAddress = '';
        let PMSInfo = {};
        //let local = false;
        let sync = false;
        let allPMSServer = await this.getPMSServers( true );
        let uris = [];
        // let uri;


        // If server is owned, we check local connection first
        if (server.owned){
            uris.push(server.connections.filter(function(x){return x.local==true})[0]['uri']);
        } else {
            uris.push(server.connections.filter(function(x){return x.local==false})[0]['uri']);
        }
        // Now add remaining connections
        for (var connIdx in server.connections)
        {
            if ( uris.indexOf(server.connections[connIdx]['uri']) == -1 ){
                uris.push(server.connections[connIdx]['uri']);
            }
        }
        log.debug(`[plextv.js] (checkServerOptions) - Valid addresses for ${server.name} are: ${JSON.stringify(uris)}`)
        // uris now contains an ordered list of addresses to test

        for (var i = 0; i < uris.length; i++) {
            //let val = server.connections[i];
            let result = false;
            log.verbose(`[plextv.js] (checkServerOptions) Checking: ${server.name} on uri: ${uris[i]}`);
            let baseurl = uris[i];
            let header = wtutils.PMSHeader;
            header['X-Plex-Token'] = server.accessToken;
            await axios.get(baseurl, {
                headers: header,
                timeout: 3000
                })
                .then(response => {
                    if(response.status == 200){
                        log.verbose(`[plextv.js] (checkServerOptions) - Address ${baseurl} is alive`);
                        
                        log.verbose(`[plextv.js] (checkServerOptions) - Need to check if correct one`);
                        const machineIdentifier = response.data['MediaContainer']['machineIdentifier'];
                        if (machineIdentifier == server.clientIdentifier){
                            log.verbose(`[plextv.js] (checkServerOptions) - Server found as: ${baseurl}`);
                            PMSAddress = baseurl;
                            sync = response.data['MediaContainer']['allowSync'];
                            result = true;
                        }
                        
                        
                    }
                    }).catch((error) => {
                    if (error.response) {
                        // The request was made and server responded with a status code
                        // that falls out of the range of 2xx
                        log.warn(`[plextv.js] (checkServerOptions) ${error.response.status}`)
                    } else if (error.request) {
                        // The request was made but no response was received
                        log.warn(`[plextv.js] (checkServerOptions) No response recieved`);
                    }
                        else {
                        // Something happened in setting up the request that triggered an Error
                        log.warn(`[plextv.js] (checkServerOptions) ${error.message}`);
                    }
                }
            )
            if (result){ break; }
        }


/* 

        // Start with the local address check first
        for (var i = 0; i < server.connections.length; i++) {
            let val = server.connections[i];
            let result = false;
            log.verbose(`[plextv.js] (checkServerOptions) Checking: ${val.protocol}://${val.address}:${val.port}`);
            let baseurl = val.protocol + '://' + val.address + ':' + val.port;
            let header = wtutils.PMSHeader;
            header['X-Plex-Token'] = server.accessToken;
            await axios.get(baseurl, {
                headers: header,
                timeout: 3000
                })
                .then(response => {
                    if(response.status == 200){
                        log.verbose(`[plextv.js] (checkServerOptions) Address ${baseurl} is alive, so check if local`);
                        if ( val.local == true){
                            log.verbose(`[plextv.js] (checkServerOptions) It's a local server, so need to check if correct one`);
                            const machineIdentifier = response.data['MediaContainer']['machineIdentifier'];
                            if (machineIdentifier == server.clientIdentifier){
                                log.verbose(`[plextv.js] (checkServerOptions) Local server found as: ${baseurl}`);
                                PMSAddress = baseurl;
                                local = true;
                                sync = response.data['MediaContainer']['allowSync'];
                                result = true;
                            }
                        }
                        else
                        {
                            // only if we didn't find the local one?
                            if ( local == false)
                            {
                                log.verbose(`[plextv.js] (checkServerOptions) No local server found yet, so checking ${baseurl}`)
                                const machineIdentifier = response.data['MediaContainer']['machineIdentifier'];
                                if (machineIdentifier == server.clientIdentifier){
                                    log.verbose(`[plextv.js] (checkServerOptions) Remote server found as: ${baseurl}`);
                                    PMSAddress = baseurl;
                                    local = false;
                                    sync = response.data['MediaContainer']['allowSync'];
                                    result = true;
                                }
                            }
                        }
                    }
                    }).catch((error) => {
                    if (error.response) {
                        // The request was made and server responded with a status code
                        // that falls out of the range of 2xx
                        log.warn(`[plextv.js] (checkServerOptions) ${error.response.status}`)
                    } else if (error.request) {
                        // The request was made but no response was received
                        log.warn(`[plextv.js] (checkServerOptions) No response recieved`);
                    }
                        else {
                        // Something happened in setting up the request that triggered an Error
                        log.warn(`[plextv.js] (checkServerOptions) ${error.message}`);
                    }
                }
            )
            if (result){ break; }
        }
        

         */

        const idx = allPMSServer.map(function(x) {return x.clientIdentifier; }).indexOf(server.clientIdentifier);
        PMSInfo['Address'] = PMSAddress;
       // PMSInfo['Local'] = local;
        PMSInfo['Sync'] = sync;
        allPMSServer[idx]["PMSInfo"] = PMSInfo
        store.commit("UPDATE_PLEX_SERVERS", allPMSServer);
        return
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
    async fetchPMSServers(){
        let header = wtutils.PMSHeader;
        header['X-Plex-Token'] = store.getters.getAuthToken;
        await axios({
            method: 'get',
            url: `${wtutils.plexTVApi}v2/resources`,
            headers: header,
            params: {
                'includeHttps' : '1',
                'includeRelay': '0'
            }
            })
            .then((response) => {
                let result=[];
                log.debug('[plextv.js] (fetchPlexServers) Response from fetchPlexServers recieved');
                const showNotOwned = wtconfig.get('Developer.showNotOwned', false);
                if (showNotOwned){
                log.debug('[plextv.js] (fetchPlexServers) fetchPlexServers : See not owned servers as well');
                }
                response.data.forEach((req) => {
                if (req.product == "Plex Media Server") {
                    let pmsServer = {};
                    pmsServer['name'] = req.name;
                    pmsServer['accessToken'] = req.accessToken;
                    pmsServer['connections'] = req.connections;
                    pmsServer['clientIdentifier'] = req.clientIdentifier;
                    pmsServer['owned'] = req.owned;
                    result.push(pmsServer);
                }
                })
                store.commit('UPDATE_PLEX_SERVERS', result);
                return true;
            })
            .catch(function (error) {
                if (error.response) {
                    log.error('fetchPlexServers: ' + error.response.data);
                    alert(error.response.data.errors[0].code + " " + error.response.data.errors[0].message);
                } else if (error.request) {
                    log.error('fetchPlexServers: ' + error.request);
                } else {
                    log.error('fetchPlexServers: ' + error.message);
        }
    });
    }
    async getPMSServers( showNotOwned = false ){
        const PMSServers = await store.getters.getPlexServers;
        let result = [];
        for (const idx in PMSServers)
        {
            if ( true == (showNotOwned || PMSServers[idx].owned ) )
            {
                result.push(PMSServers[idx]);
            }
        }
        return result;
    }
}
export {ptv};