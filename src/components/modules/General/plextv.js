const log = require('electron-log');
import axios from 'axios'
import store from '../../../store';
import { wtutils, wtconfig } from '../General/wtutils';


const ptv = new class PTV {
    constructor() {
        this.address = null;
        this.resp = null;
        this.allResp = {};
    }

    async checkServerOptions(server) {
        log.verbose(`[plextv.js] (checkServerOptions) - Checking address for server: ${server.name}`);
        let PMSAddress = '';
        let PMSInfo = {};
        //let local = false;
        let sync = false;
        let allPMSServer = await this.getPMSServers( true );
        let uris = [];
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

    testCon( address, header, clientIdentifier, local, owned ){
        axios.get(address, {
            headers: header,
            timeout: 3000
            })
            .then(response => {
                if(response.status == 200){
                    log.verbose(`[plextv.js] (testCon) - Address ${address} is alive`);
                    log.verbose(`[plextv.js] (testCon) - Need to check if correct one`);
                    const machineIdentifier = response.data['MediaContainer']['machineIdentifier'];
                    if (machineIdentifier == clientIdentifier){
                        log.verbose(`[plextv.js] (testCon) - Server found as: ${address}`);
                        if (!this.allResp[clientIdentifier]['address']){ // Add if not already present
                            this.allResp[clientIdentifier]['address'] = address;
                            this.address = address;
                            this.allResp[clientIdentifier]['resp'] = response.data['MediaContainer'];
                            this.allResp[clientIdentifier]['local'] = local;
                            this.allResp[clientIdentifier]['count'] += 1;
                            if (local || !owned){
                                this.allResp[clientIdentifier]['count'] = this.allResp[clientIdentifier]['conCount'];
                            }
                        }
                    }
                }
                }).catch((error) => {
                if (error.response) {
                    // The request was made and server responded with a status code
                    // that falls out of the range of 2xx
                    log.warn(`[plextv.js] (testCon) ${error.response.status}`);
                    this.allResp[clientIdentifier]['count'] += 1;
                } else if (error.request) {
                    // The request was made but no response was received
                    log.warn(`[plextv.js] (testCon) No response recieved`);
                    this.allResp[clientIdentifier]['count'] += 1;
                }
                    else {
                    // Something happened in setting up the request that triggered an Error
                    log.warn(`[plextv.js] (testCon) ${error.message}`);
                    this.allResp[clientIdentifier]['count'] += 1;
                }
            }
        )
    }

    async updatePMSInfo( PMS, index, options){  //Update PMS entry with missing info
        log.verbose(`[plextv.js] (updatePMSInfo) - look at server: ${PMS['name']} with an Id of: ${PMS['clientIdentifier']} to update ${options}`);
        // Let's start by setting the header once and for all
        let header = wtutils.PMSHeader;
        header['X-Plex-Token'] = PMS['accessToken'];
        const conCount = PMS['connections'].length;
        const clientIdentifier = PMS['clientIdentifier'];
        this.allResp[clientIdentifier] = {};
        this.allResp[clientIdentifier]['count'] = 0;
        this.allResp[clientIdentifier]['conCount'] = conCount;
        // Now walk each connection avail
        for (var idx in PMS['connections']){
            this.testCon(PMS['connections'][idx]['uri'], header, clientIdentifier, PMS['connections'][idx]['local'], PMS['owned']);
        }
        while (this.allResp[clientIdentifier]['count'] < conCount){
            await wtutils.sleep(250)
        }
        // Amount of info retrieved. we have two keys always
        const retInfoAmount =  Object.keys(this.allResp[clientIdentifier]).length;
        if ( Number(retInfoAmount) > 2 ){
            var allServers = await this.getPMSServers( true);
            if (!allServers[index]['PMSInfo']){
                allServers[index]['PMSInfo'] = {};
            }
            for ( var optionIdx in options) {
                var result;
                if ( this.allResp[clientIdentifier][options[optionIdx]] ){
                    result = this.allResp[clientIdentifier][options[optionIdx]];
                } else {
                    result = this.allResp[clientIdentifier]['resp'][options[optionIdx]];
                }
                allServers[index]['PMSInfo'][options[optionIdx]] = result;
                log.debug(`[plextv.js] (updatePMSInfo) - Adding ${options[optionIdx]} to PMSInfo with a value of ${result}`)
            }
            store.commit('UPDATE_PLEX_SERVERS', allServers);
            store.commit('UPDATE_ServersUpdated', true);
        }
    }
}
export {ptv};