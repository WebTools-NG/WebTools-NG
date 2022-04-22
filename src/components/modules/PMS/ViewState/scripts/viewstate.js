// Helper file for dvr.tv module
const log = require('electron-log');
const {JSONPath} = require('jsonpath-plus');
console.log = log.log;


import {wtutils} from '../../../General/wtutils';
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
        2: i18n.t("Modules.PMS.ViewState.Status.Names.LibsToProcess")
    }

    constructor() {
        this.selServerServerToken = '',
        this.viewStateUsers = [],
        this.libs = {}
    }

    async copyViewState( SrcUsr, TargetUsr ){
        log.info('[viewstate.js] Starting copyViewState');

        console.log('Ged 1 SrcUsr: ' + JSON.stringify(SrcUsr))
        console.log('Ged 2 TargetUsr: ' + JSON.stringify(TargetUsr))

        this.updateStatusMsg(1,  i18n.t("Modules.PMS.ViewState.Status.Msg.Processing"));
        await this.getLibs( SrcUsr, TargetUsr );
        this.updateStatusMsg(1, "Ged")
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
        log.info('[viewstate.js] Starting getLibs');
        this.clearStatus();
        this.updateStatusMsg(1, i18n.t("Modules.PMS.ViewState.Status.Msg.GatheringLibs"));
        this.libs = {};
        console.log('Ged 7-1: *' + SrcUsr["id"] + '*')
        if (SrcUsr["id"] == "")
        {
            // We need to add all libs from target usr
            log.debug(`[viewstate.js] SrcUsr is owner`);
            for(let i of TargetUsr["libs"]) {
                this.libs[i.key] = i.title;
            }

        }
        else
        {
            if (TargetUsr["id"] == ""){
                // We need to add all libs from Source usr
                log.debug(`[viewstate.js] TargetUsr is owner`);
                for(let i of SrcUsr["libs"]) {
                    this.libs[i.key] = i.title;
                }
            }
            else {
                for(let i of SrcUsr["libs"]) {
                    if ( JSON.stringify(TargetUsr["libs"]).indexOf(JSON.stringify(i)) > -1)
                    {
                        this.libs[i.key] = i.title;
                    }
                }
            }
        }
        let libstatus = []
        for (let lib in this.libs){
            libstatus.push(this.libs[lib])
        }
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