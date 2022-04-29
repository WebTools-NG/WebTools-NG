// Helper file for dvr.tv module
const log = require('electron-log');
const {JSONPath} = require('jsonpath-plus');
console.log = log.log;


import {wtutils, wtconfig} from '../../../General/wtutils';
import i18n from '../../../../../i18n';
import store from '../../../../../store';
import axios from 'axios';

const viewstate = new class ViewState {
    // Private Fields
    #_FieldHeader = [];
    #_StartTime = null;
    #_EndTime = null;
    #_statusmsg = {};
    #_msgType = {
        1: i18n.t("Modules.PMS.ViewState.Status.Names.Status"),
        2: i18n.t("Modules.PMS.ViewState.Status.Names.LibsToProcess"),
        3: i18n.t("Modules.PMS.ViewState.Status.Names.StartTime"),
        4: i18n.t("Modules.PMS.ViewState.Status.Names.CurrentLib")
    }

    constructor() {
        this.selServerServerToken = '',
        this.viewStateUsers = [],
        this.libs = {},
        this.SrcUsrToken1 = '',
        this.TargetUsrToken1 = '',
        this.SrcUsr,
        this.TargetUsr,
        this.libType
    }

    async setOwnerStatus( Usr, data ){
        if ( Usr == 'selSrcUsr' ){
            this.SrcUsr['isOwner'] = (JSONPath({path: `$..libs[0].key`, json: data})[0] != 1);
        }
        else {
            this.TargetUsr['isOwner'] = (JSONPath({path: `$..libs[0].key`, json: data})[0] != 1);
        }
    }

    async getNowTime(StartEnd){
        let now = new Date();
        if (StartEnd == 'start')
        {
            this.#_StartTime = now;
        }
        else
        {
            this.#_EndTime = now;
        }
        let hours = now.getHours();
        let minutes = now.getMinutes();
        let seconds = now.getSeconds();
        if ( hours.toString().length < 2) { hours = '0' + hours}
        if ( minutes.toString().length < 2) { minutes = '0' + minutes}
        if ( seconds.toString().length < 2) { seconds = '0' + seconds}
        return hours + ':' + minutes + ':' + seconds;
    }

    async setLibType( libKey ){
        switch(this.libs[libKey]['type']) {
            case 'movie':
                this.libType = 1;
                break;
            case 'show':
                this.libType = 4;
                break;
            default:
                this.libType = 1;
          }
    }

    async getAmountOfWatched( libKey ){
        log.info(`Getting amount of watched items`);
        await this.setLibType( libKey );
        let url = `${store.getters.getSelectedServerAddress}/library/sections/${libKey}/all?type=${this.libType}&lastViewedAt%3E%3E=1970-01-01&X-Plex-Container-Start=0&X-Plex-Container-Size=0`;
        let header = wtutils.PMSHeader;
        let totalSize;
        header['X-Plex-Token'] = this.SrcUsr.token;
        await axios({
            method: 'get',
            url: url,
            headers: header
          })
            .then((response) => {
                log.debug('[viewState.js] (getAmountOfWatched) Response from getAmountOfWatched recieved');
                //log.silly(`getAmountOfWatched returned as: ${JSON.stringify(response.data)}`);
                totalSize = JSONPath({path: `$..totalSize`, json: response.data});
                log.debug(`[viewState.js] (getAmountOfWatched) Total Size: ${totalSize}`);
            })
            .catch(function (error) {
              if (error.response) {
                  log.error('[viewState.js] (getAmountOfWatched) getAmountOfWatched: ' + JSON.stringify(error.response.data));
                  alert(error.response.data.errors[0].code + " " + error.response.data.errors[0].message);
              } else if (error.request) {
                  log.error('[viewState.js] (getAmountOfWatched) error: ' + error.request);
              } else {
                  log.error('[viewState.js] (getAmountOfWatched) last error: ' + error.message);
            }
        });
        return totalSize;
    }

    async processWatchedList( libKey ){
        log.info('[viewstate.js] (processWatchedList) Process Watched list');
        let totalSize //, size;
        let start = 0;
        totalSize = await this.getAmountOfWatched( libKey );
        const step = wtconfig.get("PMS.ContainerSize." + this.libs[libKey]['type'], 20);
        console.log('Ged 41-3 Steps: ' + step)

        totalSize, start
        let url, gotSize;
        do  // Walk section in steps
        {
            url = `${store.getters.getSelectedServerAddress}/library/sections/${libKey}/all?type=${this.libType}&lastViewedAt%3E%3E=1970-01-01&X-Plex-Container-Start=${start}&X-Plex-Container-Size=${step}`;
            // Now go grab the medias
            let header = wtutils.PMSHeader;
            header['X-Plex-Token'] = this.SrcUsr.token;
            await axios({
                method: 'get',
                url: url,
                headers: header
            })
                .then((response) => {
                    log.debug('[viewState.js] (processWatchedList) Response from processWatchedList recieved');
                    log.silly(`processWatchedList returned as: ${JSON.stringify(response.data)}`);
                    gotSize = JSONPath({path: `$.MediaContainer.size`, json: response.data})[0];

                    console.log('Ged 44-0 gotSize: ' + gotSize)
                    const medias = JSONPath({path: `$..Metadata`, json: response.data})[0];
                    for (var media in medias){
                        console.log('Ged 44-4 Media: ' + JSON.stringify(medias[media]))
                        const title = JSONPath({path: `$..title`, json: response.data})[0];
                        console.log('Ged 44-5 title: ' + title)
                        const viewOffset = JSONPath({path: `$..viewOffset`, json: response.data})[0];
                        console.log('Ged 44-6 viewOffset: ' + viewOffset)
                        const lastViewedAt = JSONPath({path: `$..lastViewedAt`, json: response.data})[0];
                        console.log('Ged 44-7 lastViewedAt: ' + lastViewedAt)

                        

                    }

                    
                    //totalSize = JSONPath({path: `$..totalSize`, json: response.data});
                    
                })
                .catch(function (error) {
                if (error.response) {
                    log.error('[viewState.js] (processWatchedList) processWatchedList: ' + JSON.stringify(error.response.data));
                    alert(error.response.data.errors[0].code + " " + error.response.data.errors[0].message);
                } else if (error.request) {
                    log.error('[viewState.js] (processWatchedList) error: ' + error.request);
                } else {
                    log.error('[viewState.js] (processWatchedList) last error: ' + error.message);
                }
            });




            console.log('Ged 55-0: ' + url)


            start += step;


        } while ( gotSize > 0);

    }

    async walkSourceUsr(){
        log.info('[viewstate.js] (walkSourceUsr) Walking SourceUsr');
        console.log('Ged 39 DANGER: ' + JSON.stringify(this.SrcUsr))
        console.log('Ged 40 Libs: ' + JSON.stringify(this.libs))
        var keyCount  = Object.keys(this.libs).length;
        console.log('Ged 40-2 Libs count 2: ' + keyCount)

        for (var libKey in this.libs){
            this.updateStatusMsg(4,  i18n.t("Modules.PMS.ViewState.Status.Msg.Processing2", [libKey, keyCount, this.libs[libKey]['title']]));
            await this.processWatchedList( libKey );


        }
    }

    async getUsrTokens(){
        log.info('[viewstate.js] Starting getUsrTokens');
        // Ask for a list of devices
        let header = wtutils.PMSHeader;
        // Add server token
        header['X-Plex-Token'] = this.selServerServerToken[0];
        // Remove unwanted headers
        delete header['X-Plex-Client-Identifier']
        delete header['X-Plex-Device']
        delete header['X-Plex-Product']
        delete header['X-Plex-Version']
        const url = `${wtutils.plexTVApi}v2/server/access_tokens`;
        await axios({
            method: 'get',
            url: url,
            headers: header
          })
            .then((response) => {
                log.debug('[viewState.js] Response from getUsrTokens recieved');
                //log.silly(`getUsrTokens returned as: ${JSON.stringify(response.data)}`);
                var users = JSONPath({path: `$..[?(@.type == 'server')]`, json: response.data});
                for (var user in users){
                    var userInfo = users[user]
                    if ( userInfo['invited']['id'] == this.SrcUsr['id']){
                        if ( store.getters.getUsers[userInfo['invited']['id']]['friendlyName'] ){
                            this.SrcUsr['title'] = store.getters.getUsers[userInfo['invited']['id']]['friendlyName'];
                        }
                        else {
                            this.SrcUsr['title'] = userInfo['invited']['title'];
                        }
                        this.SrcUsr['token'] = userInfo['token'];
                    }
                    else if ( userInfo['invited']['id'] == this.TargetUsr['id']){
                        if ( store.getters.getUsers[userInfo['invited']['id']]['friendlyName'] ){
                            this.TargetUsr['title'] = store.getters.getUsers[userInfo['invited']['id']]['friendlyName'];
                        }
                        else {
                        this.TargetUsr['title'] = userInfo['invited']['title'];
                        }
                        this.TargetUsr['token'] = userInfo['token'];
                    }
                }
                if (this.SrcUsr.isOwner){
                    this.SrcUsr['token'] = store.getters.getAuthToken;
                    this.SrcUsr['title'] = store.getters.getPlexName;
                    this.SrcUsr['id'] = store.getters.getMeId;
                }
                if (this.TargetUsr.isOwner){
                    this.TargetUsr['token'] = store.getters.getAuthToken;
                    this.TargetUsr['title'] = store.getters.getPlexName;
                    this.TargetUsr['id'] = store.getters.getMeId;
                }
            })
            .catch(function (error) {
              if (error.response) {
                  log.error('[viewState.js] getUsrTokens: ' + JSON.stringify(error.response.data));
                  alert(error.response.data.errors[0].code + " " + error.response.data.errors[0].message);
              } else if (error.request) {
                  log.error('[viewState.js] getUsrTokens: ' + error.request);
              } else {
                  log.error('[viewState.js] getUsrTokens: ' + error.message);
            }
        });

    }

    async copyViewState( SrcUsr, TargetUsr ){
        log.info('[viewstate.js] Starting copyViewState');
        const startTime = await this.getNowTime('start');
        this.updateStatusMsg(3,  startTime);


        this.updateStatusMsg(1,  i18n.t("Modules.PMS.ViewState.Status.Msg.Processing"));
        await this.getLibs( SrcUsr, TargetUsr );
        await this.getUsrTokens();
        await this.walkSourceUsr();
        //this.updateStatusMsg(1, "Ged")
    }

    // Update status msg
    async updateStatusMsg(msgType, msg)
    {
        // Update relevant key
        this.#_statusmsg[msgType] = msg;
        // Tmp store of new msg
        let newMsg = '';
        // Walk each current msg keys
        Object.entries(this.#_statusmsg).forEach(([key, value]) => {
            if ( value != '')
            {
                newMsg += this.#_msgType[key] + ': ' + value + '\n';
            }
        })
        store.commit("UPDATE_viewStateStatus", newMsg);
    }

    // Clear Status Window
    async clearStatus()
    {
        this.#_statusmsg = {};
        store.commit("UPDATE_viewStateStatus", '');
        return;
    }

    async getLibs( SrcUsr, TargetUsr ){
        log.info('[viewstate.js] (getLibs) Starting getLibs');
        log.silly(`[viewstate.js] (getLibs) SrcUsr: ${JSON.stringify(SrcUsr)}`);
        log.silly(`[viewstate.js] (getLibs) TargetUsr: ${JSON.stringify(TargetUsr)}`);
        // Are both users selected ?
        if ( !(this.TargetUsr && this.SrcUsr) ){
            log.info('[viewstate.js] (getLibs) Both users not yet selected, so exit');
            return;
        }
        if ( JSON.stringify(SrcUsr) === JSON.stringify(TargetUsr) ){
            this.clearStatus();
            this.updateStatusMsg(1, i18n.t("Modules.PMS.ViewState.Status.Msg.Idle"));
            log.info('[viewstate.js] Same user selected, so aborting');
            return;
        }
        this.clearStatus();
        this.updateStatusMsg(1, i18n.t("Modules.PMS.ViewState.Status.Msg.GatheringLibs"));
        log.silly(`[viewstate.js] (getLibs) Source usr: ${JSON.stringify(SrcUsr)}`);
        log.silly(`[viewstate.js] (getLibs) Target usr: ${JSON.stringify(TargetUsr)}`);
        this.libs = {};
        if ( JSONPath({path: `$..libs[0].key`, json: SrcUsr}) == 0 )
        {
            // We need to add all libs from target usr
            log.debug(`[viewstate.js] SrcUsr is owner`);
            for(let i of TargetUsr["libs"]) {
                let entry = {};
                entry['title'] = i.title;
                entry['type'] = i.type;
                this.libs[i.key] = entry;
            }
        }
        else
        {
            if ( JSONPath({path: `$..libs[0].key`, json: TargetUsr}) == 0 ){
                // We need to add all libs from Source usr
                log.debug(`[viewstate.js] TargetUsr is owner`);
                for(let i of SrcUsr["libs"]) {
                    let entry = {};
                    entry['title'] = i.title;
                    entry['type'] = i.type;
                    this.libs[i.key] = entry;
                }
            }
            else {
                for(let i of SrcUsr["libs"]) {
                    if ( JSON.stringify(TargetUsr["libs"]).indexOf(JSON.stringify(i)) > -1)
                    {
                        let entry = {};
                        entry['title'] = i.title;
                        entry['type'] = i.type;
                        this.libs[i.key] = entry;
                    }
                }
            }
        }
        let libstatus = []
        for (let lib in this.libs){
            libstatus.push(this.libs[lib]['title'])
        }
        this.updateStatusMsg(1, i18n.t("Modules.PMS.ViewState.Status.Msg.Idle"));
        this.updateStatusMsg(2, libstatus.join(', '))
    }

    // Here we get the server token for the selected server
    async getServerToken(){
        // Start by finding selected servers clientIdentifier
        const clientIdentifier = store.getters.getSelectedServer.clientIdentifier;
        // Ask for a list of devices
        let header = wtutils.PMSHeader;
        header['X-Plex-Token'] = store.getters.getAuthToken;
        const url = `${wtutils.plexTVApi}v2/devices`;
        await axios({
            method: 'get',
            url: url,
            headers: header
          })
            .then((response) => {
              log.debug('[viewState.js] Response from getServerToken recieved');
              //log.silly(`getServerToken returned as: ${JSON.stringify(response.data)}`);
              this.selServerServerToken = JSONPath({path: `$[?(@.clientIdentifier== '${clientIdentifier}')].token`, json: response.data});
              log.silly(`[viewState.js] selServerServerToken returned as: ${this.selServerServerToken}`);
            })
            .catch(function (error) {
              if (error.response) {
                  log.error('[viewState.js] getServerToken: ' + error.response.data);
                  alert(error.response.data.errors[0].code + " " + error.response.data.errors[0].message);
              } else if (error.request) {
                  log.error('[viewState.js] getServerToken: ' + error.request);
              } else {
                  log.error('[viewState.js] getServerToken: ' + error.message);
            }
        });
    }

    // Get selected server sharelist
    async getShareList(){
        log.info('[viewState.js] Start getShareList');
        // We can't use the normal header
        let header = {
            'Accept': 'application/json',
            'X-Plex-Token': this.selServerServerToken[0]
        };
        const url = `${wtutils.plexTVApi}v2/server/sharing`;
        let retVal
        await axios({
            method: 'get',
            url: url,
            headers: header
          })
            .then((response) => {
              log.debug('[viewState.js] Response from getShareList recieved');
              log.silly(`[viewState.js] getShareList returned as: ${JSON.stringify(response.data)}`);
              retVal = JSON.stringify(response.data)
            })
            .catch(function (error) {
              if (error.response) {
                  log.error('[viewState.js] getShareList1: ' + JSON.stringify(error.response.data));
                  alert(error.response.data.errors[0].code + " " + error.response.data.errors[0].message);
              } else if (error.request) {
                  log.error('[viewState.js] getShareList2: ' + error.request);
              } else {
                  log.error('[viewState.js] getShareList3: ' + error.message);
            }
        });
        return retVal
    }

    // Get a list of users
    async getUsers(){
        log.info('[viewState.js] Start getUsers');
        let Users = store.getters.getUsers;
        // Already got the users ?
        if (Object.keys(Users).length == 0){
            await store.dispatch('fetchUsers');
            Users = store.getters.getUsers;
        }
        await this.getServerToken();
        this.viewStateUsers = [];
        // Get a list of users only on this server
        let shareList = await this.getShareList();
        // Now we need to walk them one by one
        for(const sharedUsr of JSON.parse(shareList)) {
            let name = Users[sharedUsr['id']]["friendlyName"];
            if (!name){
                name = Users[sharedUsr['id']]["title"];
            }
            if (!Users[sharedUsr['id']]["email"])
            {
                name = `${name} ***( ${i18n.t("Modules.PMS.ViewState.Managed")} )***`
            }
            let usr = { value: { "id": sharedUsr['id'], "libs": sharedUsr['librarySections']}, text: name };
            this.viewStateUsers.push(usr);
        }
        // Now we need to add Server Owner
        let usr = { value: { "id": `${store.getters.getMeId}`, "libs": [{"id":null,"key":0,"title":"*","type":"*"}]}, text: `${store.getters.getPlexName} ***( ${i18n.t("Modules.PMS.ViewState.Owner")} )***` };
        this.viewStateUsers.push(usr);
    }
}


export { viewstate };