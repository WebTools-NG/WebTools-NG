// Helper file for dvr.tv module
const log = require('electron-log');
const {JSONPath} = require('jsonpath-plus');
console.log = log.log;


import {wtutils} from '../../../General/wtutils';
import i18n from '../../../../../i18n';
import store from '../../../../../store';
import axios from 'axios';

const wiewstate = new class WiewState {
    // Private Fields
    #_FieldHeader = [];
    #_StartTime = null;
    #_EndTime = null;
    #_statusmsg = {};
    #_msgType = {
        1: i18n.t("Modules.PMS.WiewState.Status.Names.Status")
    }

    constructor() {
        this.selServerServerToken = '',
        this.viewStateUsers = []
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
              log.silly(`getShareList returned as: ${JSON.stringify(response.data)}`);
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
                name = `${name} ***( ${i18n.t("Modules.PMS.WiewState.Managed")} )***`
            }
            let usr = { value: { "id": sharedUsr['id'], "libs": sharedUsr['librarySections']}, text: name };
            this.viewStateUsers.push(usr);
        }
        // Now we need to add Server Owner
        let usr = { value: { "id": store.getters.getMeId, "libs": "PMSOwner"}, text: `${store.getters.getPlexName} ***( ${i18n.t("Modules.PMS.WiewState.Owner")} )***` };
        this.viewStateUsers.push(usr);
    }
}


export { wiewstate };