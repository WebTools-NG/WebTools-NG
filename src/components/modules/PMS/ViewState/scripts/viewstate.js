// Helper file for dvr.tv module
const log = require('electron-log');
const {JSONPath} = require('jsonpath-plus');
console.log = log.log;


import {wtutils, wtconfig} from '../../../General/wtutils';
import { time } from '../../../General/time';
import { status } from '../../../General/status';
import i18n from '../../../../../i18n';
import store from '../../../../../store';
import axios from 'axios';

var sanitize = require("sanitize-filename");

const viewstate = new class ViewState {

    constructor() {
        this.selServerServerToken = '',
        this.viewStateUsers = [],
        this.libs = {},
        this.SrcUsrToken1 = '',
        this.TargetUsrToken1 = '',
        this.SrcUsr,
        this.TargetUsr,
        this.libType,
        this.currentLib,
        this.genRep = false;
        this.outFile = '',
        this.csvStream,
        this.headers = '"library","ratingKey","title","viewCount","viewOffset"'
    }

    async setOwnerStatus( Usr, data ){
        if ( Usr == 'selSrcUsr' ){
            this.SrcUsr['isOwner'] = (JSONPath({path: `$..libs[0].key`, json: data})[0] == 0);
        }
        else {
            this.TargetUsr['isOwner'] = (JSONPath({path: `$..libs[0].key`, json: data})[0] == 0);
        }
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

    async bumpViewCount( media ){
        const ratingKey = JSONPath({path: `$..ratingKey`, json: media});
        const title = JSONPath({path: `$..title`, json: media});
        const viewCount = JSONPath({path: `$..viewCount`, json: media});
        const viewOffset = JSONPath({path: `$..viewOffset`, json: media});
        const duration = JSONPath({path: `$..duration`, json: media});
        if ( this.genRep ){
            let watchTime = await time.convertMsToTime(viewOffset);
            if ( watchTime === "00:00:00"){
                watchTime = "";
            }
            else {
                watchTime = `"${watchTime}"`
            }
            const row = `"${this.currentLib}",${ratingKey},"${title}",${viewCount},${watchTime}\n`;
            this.csvStream.write( row );
        }
        log.info(`Bumbing viewcount to ${viewCount} for media ${ratingKey}`);
        let url = `${store.getters.getSelectedServerAddress}/:/scrobble?identifier=com.plexapp.plugins.library&key=${ratingKey}`;
        // We need to bump viewcount for target user same amount as for SrcUsr
        let header = wtutils.PMSHeader;
        header['X-Plex-Token'] = this.TargetUsr.token;
        for (var i = 0; i < viewCount; i++)
        {
            await axios({
                method: 'get',
                url: url,
                headers: header
            })
                .catch(function (error) {
                if (error.response) {
                    log.error('[viewState.js] (bumpViewCount) bumpViewCount: ' + JSON.stringify(error.response.data));
                    alert(error.response.data.errors[0].code + " " + error.response.data.errors[0].message);
                } else if (error.request) {
                    log.error('[viewState.js] (bumpViewCount) error: ' + error.request);
                } else {
                    log.error('[viewState.js] (bumpViewCount) last error: ' + error.message);
                }
            });
        }
        // Do we need to also set an offset value?
        if ( viewOffset > 0)
        {
            url = `${store.getters.getSelectedServerAddress}/:/timeline?ratingKey=${ratingKey}&key=%2Flibrary%2Fmetadata%2F${ratingKey}&state=stopped&time=${viewOffset}&duration=${duration}`;
            await axios({
                method: 'get',
                url: url,
                headers: header
            })
                .catch(function (error) {
                if (error.response) {
                    log.error('[viewState.js] (bumpViewCount) viewOffset: ' + JSON.stringify(error.response.data));
                    alert(error.response.data.errors[0].code + " " + error.response.data.errors[0].message);
                } else if (error.request) {
                    log.error('[viewState.js] (bumpViewCount) viewOffset error: ' + error.request);
                } else {
                    log.error('[viewState.js] (bumpViewCount) viewOffset last error: ' + error.message);
                }
            });
        }
        status.updateStatusMsg(status.RevMsgType.TimeElapsed, await time.getTimeElapsed());
    }

    async processWatchedList( libKey ){
        log.info('[viewstate.js] (processWatchedList) Process Watched list');
        let totalSize //, size;
        let start = 0;
        let index = 0;
        totalSize = await this.getAmountOfWatched( libKey );
        const step = wtconfig.get("PMS.ContainerSize." + this.libs[libKey]['type'], 20);
        let url, gotSize;
        do  // Walk section in steps
        {
            let listProcess = {};
            url = `${store.getters.getSelectedServerAddress}/library/sections/${libKey}/all?type=${this.libType}&lastViewedAt%3E%3E=1970-01-01&X-Plex-Container-Start=${start}&X-Plex-Container-Size=${step}&excludeElements=Genre,Director,Writer,Country,Role,Producer,Collections,Media&excludeFields=summary,tagline,rating,contentRating,audienceRatingImage,file`;
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
                    const medias = JSONPath({path: `$..Metadata`, json: response.data})[0];
                    for (var media in medias){
                        let listProcessDetails = {};
                        listProcessDetails['title'] = JSONPath({path: `$..title`, json: medias[media]})[0];
                        listProcessDetails['viewOffset'] = JSONPath({path: `$..viewOffset`, json: medias[media]})[0];
                        listProcessDetails['lastViewedAt'] = JSONPath({path: `$..lastViewedAt`, json: medias[media]})[0];
                        listProcessDetails['viewCount'] = JSONPath({path: `$..viewCount`, json: medias[media]})[0];
                        listProcessDetails['duration'] = JSONPath({path: `$..duration`, json: medias[media]})[0];
                        listProcessDetails['ratingKey'] = JSONPath({path: `$..ratingKey`, json: medias[media]})[0];
                        listProcess[JSONPath({path: `$..ratingKey`, json: medias[media]})[0]] = listProcessDetails;
                        index += 1;
                        this.bumpViewCount( listProcessDetails );
                        status.updateStatusMsg(status.RevMsgType.Item, i18n.t("Common.Status.Msg.ProcessItem_1_2", [listProcessDetails['title'], index, totalSize]));
                    }
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
            start += step;
        } while ( gotSize == step );
    }

    async walkSourceUsr(){
        log.info('[viewstate.js] (walkSourceUsr) Walking SourceUsr');
        var keyCount  = Object.keys(this.libs).length;
        let index = 1;
        for (var libKey in this.libs){
            this.currentLib = this.libs[libKey]['title'];
            status.updateStatusMsg( status.RevMsgType.LibsToProcess, i18n.t("Common.Status.Msg.Processing_Lib_1_2", [index, keyCount, this.libs[libKey]['title']]));
            await this.processWatchedList( libKey );
            index += 1;
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

    // Generate the filename for an export
    async getFileName( Type ){
        const dateFormat = require('dateformat');
        const OutDir = wtconfig.get('General.ExportPath');
        const timeStamp=dateFormat(new Date(), "yyyy.mm.dd_h.MM.ss");
        const path = require('path');
        let arrFile = [];
        arrFile.push(sanitize(store.getters.getSelectedServer.name));
        const names = `${JSONPath({path: "$.title", json: this.SrcUsr})[0]}-${JSONPath({path: "$.title", json: this.TargetUsr})[0]}`;
        arrFile.push(sanitize(names));
        arrFile.push(timeStamp + '.' + Type + '.tmp');
        this.outFile = arrFile.join('_');
        // Remove unwanted chars from outfile name
        const targetDir = path.join(
            OutDir, wtutils.AppName, i18n.t('Modules.PMS.Name'), i18n.t('Modules.PMS.ViewState.Name'));
        const outFileWithPath = path.join(
            targetDir, this.outFile);
        // Make sure target dir exists
        const fs = require('fs')
        if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
        }
        log.info(`etHelper (getFileName) OutFile ET is ${outFileWithPath}`);
        this.outFile = outFileWithPath;
    }

    async addHeaderToTmp({ stream: stream })
    {
        // Add the header
        await stream.write( this.headers + "\n");
        log.info(`Added CSV Header as: ${this.header}`);
    }

    async createOutFile()
    {
        var fs = require('fs');
        // Create CSV Stream
        if ( this.genRep ){
            // Open a file stream
            await this.getFileName( 'csv' );
            this.csvStream = fs.createWriteStream(this.outFile, {flags:'a'});
            await this.addHeaderToTmp({ stream: this.csvStream });
        }
    }

    async closeOutFile()
    {
        // Close if used
        if ( this.genRep ){
            var fs = require('fs');
            let newFile;
            // Close Stream
            this.csvStream.end();
            // Rename to real file name
            newFile = this.outFile.replace('.tmp', '')
            fs.renameSync(this.outFile, newFile);
            this.outFile = newFile;
        }
    }

    async copyViewState( SrcUsr, TargetUsr ){
        log.info('[viewstate.js] Starting copyViewState');
        time.setStartTime();
        await this.getLibs( SrcUsr, TargetUsr );
        status.updateStatusMsg(status.RevMsgType.StartTime,  await time.getStartTime());
        status.updateStatusMsg(status.RevMsgType.Status,  i18n.t("Common.Status.Msg.Processing"));
        await this.getUsrTokens();
        // Generate report?
        this.genRep = wtconfig.get("PMS.ViewState.ExpReport", false);
        if ( this.genRep ){
            await this.createOutFile();
        }
        await this.walkSourceUsr();
        await this.closeOutFile();
        time.setEndTime();
        // Update status window
        status.clearStatus();
        status.updateStatusMsg(status.RevMsgType.OutFile,  this.outFile);
        status.updateStatusMsg(status.RevMsgType.Status, i18n.t("Common.Status.Msg.Idle"));
        status.updateStatusMsg(status.RevMsgType.TimeElapsed, await time.getTimeDifStartEnd());
        status.updateStatusMsg(status.RevMsgType.StartTime, await time.getStartTime());
        status.updateStatusMsg(status.RevMsgType.EndTime, await time.getEndTime());
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
            status.clearStatus();
            status.updateStatusMsg(status.RevMsgType.Status, i18n.t("Common.Status.Msg.Idle"));
            log.info('[viewstate.js] Same user selected, so aborting');
            return;
        }
        status.clearStatus();
        status.updateStatusMsg(status.RevMsgType.Status, i18n.t("Common.Status.Msg.GatheringLibs"));
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
        status.updateStatusMsg(status.RevMsgType.Status, i18n.t("Common.Status.Msg.Idle"));
        status.updateStatusMsg(status.RevMsgType.Info, libstatus.join(', '))
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
              this.selServerServerToken = JSONPath({path: `$[?(@.clientIdentifier== '${clientIdentifier}')].token`, json: response.data});
              log.silly(`[viewState.js] selServerServerToken returned ok`);
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