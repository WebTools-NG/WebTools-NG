// Helper file for dvr.tv module
const log = require('electron-log');
const {JSONPath} = require('jsonpath-plus');
console.log = log.log;


import {wtconfig, wtutils, dialog} from '../../../General/wtutils';
import i18n from '../../../../../i18n';
import store from '../../../../../store';
import axios from 'axios';

const dvr = new class DVR {

    constructor() {
        this.fileDVRRestore = '';
        this.dvrList = [];
        this.dvrKey = 0;
        this.deviceKey = 0;
    }

    async getDVRList(){
        log.info(`Getting list of DVRs`);
        // Placeholder for return value
        let arrDVR = [];
        let header = wtutils.PMSHeader;
        header['X-Plex-Token'] = store.getters.getSelectedServerToken;
        const url = `${store.getters.getSelectedServerAddress}/livetv/dvrs`;
        log.verbose(`Url to query is: ${url}`);
        let DVRs;
        await axios({
            method: 'get',
            url: url,
            headers: header
          })
            .then((response) => {
              log.debug('Response from getDVRList recieved');
              DVRs = JSONPath({path: '$..Dvr[*]', json: response.data});
              // Save to store
              store.commit('UPDATE_DVR_SETTINGS', DVRs);
              log.verbose('DVRs added to store')
            })
            .catch(function (error) {
              if (error.response) {
                  log.error('getDVRList: ' + error.response.data);
                  alert(error.response.data.errors[0].code + " " + error.response.data.errors[0].message);
              } else if (error.request) {
                  log.error('getDVRList: ' + error.request);
              } else {
                  log.error('getDVRList: ' + error.message);
            }
          });
            DVRs.forEach(dvr => {
                arrDVR.push({
                    "value": JSONPath({path: '$.uuid', json: dvr}),
                    "text": JSONPath({path: '$.lineupTitle', json: dvr})
                    })
        });
        this.dvrList = arrDVR;
        return arrDVR;
    }

    async setDvrPrefs(){
        log.debug('Start DVR Settings');
        let url = '';
        let arrSettings = []
        const Settings = JSONPath({path: '$.Setting', json: this.fileDVRRestore});
        Settings[0].forEach(Setting => {
            arrSettings.push(Setting['id'] + '=' + Setting['value'])
            });
        url = `${store.getters.getSelectedServerAddress}/livetv/dvrs/${this.dvrKey}/prefs?` + arrSettings.join("&");
        let header = wtutils.PMSHeader;
        header['X-Plex-Token'] = store.getters.getSelectedServerToken;
        await axios({
            method: 'put',
            url: url,
            headers: header
            })
            .then((response) => {
                log.debug('Response from setDvrPrefs recieved');
                log.silly(`DVR Set as: ${JSON.stringify(response.data)}`);
            })
            .catch(function (error) {
                if (error.response) {
                    log.error('setDvrPrefs: ' + error.response.data);
                    alert(error.response.data.errors[0].code + " " + error.response.data.errors[0].message);
                } else if (error.request) {
                    log.error('setDvrPrefs: ' + error.request);
                } else {
                    log.error('setDvrPrefs: ' + error.message);
            }
        });
    }

    async setDevicePrefs(){
        console.log('Ged 0 ************ SET Device Settings *********')
        log.debug('Start Device Settings');
        let url = '';
        let arrSettings = []
        const Settings = JSONPath({path: '$..Device[0].Setting', json: this.fileDVRRestore});
        Settings[0].forEach(Setting => {
            arrSettings.push(Setting['id'] + '=' + Setting['value'])
            });
        url = `${store.getters.getSelectedServerAddress}/media/grabbers/devices/${this.deviceKey}/prefs?` + arrSettings.join("&");
        let header = wtutils.PMSHeader;
        header['X-Plex-Token'] = store.getters.getSelectedServerToken;
        await axios({
            method: 'put',
            url: url,
            headers: header
            })
            .then((response) => {
                log.debug('Response from setDevicePrefs recieved');
                log.silly(`setDevicePrefs Set as: ${JSON.stringify(response.data)}`);
            })
            .catch(function (error) {
                if (error.response) {
                    log.error('setDevicePrefs: ' + error.response.data);
                    alert(error.response.data.errors[0].code + " " + error.response.data.errors[0].message);
                } else if (error.request) {
                    log.error('setDevicePrefs: ' + error.request);
                } else {
                    log.error('setDvrPrefs: ' + error.message);
            }
        });
        const DvrTitle = encodeURIComponent(JSONPath({path: '$..Device[0].title', json: this.fileDVRRestore}));
        url = `${store.getters.getSelectedServerAddress}/media/grabbers/devices/${this.deviceKey}?title=${DvrTitle}&enabled=1`;
        await axios({
            method: 'put',
            url: url,
            headers: header
            })
            .then((response) => {
                log.debug('Response from setDeviceTitle recieved');
                log.silly(`setDeviceTitle Set as: ${JSON.stringify(response.data)}`);
            })
            .catch(function (error) {
                if (error.response) {
                    log.error('setDeviceTitle: ' + error.response.data);
                    alert(error.response.data.errors[0].code + " " + error.response.data.errors[0].message);
                } else if (error.request) {
                    log.error('setDeviceTitle: ' + error.request);
                } else {
                    log.error('setDeviceTitle: ' + error.message);
            }
        });
    }

    async setDeviceMapping(){
        console.log('Ged 0 ************ SET Device Mapping *********')
        new Promise((resolve) => {
            resolve
        });
    }


    /// This will create a DVR
    async createDVR(){
        console.log('Ged 1 CreateDVR started')
        let devices = [];
        // Store array of devices
        devices = JSONPath({path: '$..Device[*].uuid', json: this.fileDVRRestore});
        // To create the DVR, we should only use the first DVR
        const paramDevice = encodeURIComponent(devices[0]);
        // Now we need the DVR lineup
        const paramLineUp = encodeURIComponent(JSONPath({path: '$.lineup', json: this.fileDVRRestore}));
        // Get DVR Language
        const paramLang = JSONPath({path: '$.language', json: this.fileDVRRestore});
        // Get DVR Country
        const paramCountry = JSONPath({path: '$.country', json: this.fileDVRRestore});
        const url = `${store.getters.getSelectedServerAddress}/livetv/dvrs?device=${paramDevice}&lineup=${paramLineUp}&language=${paramLang}&country=${paramCountry}`
        let header = wtutils.PMSHeader;
        header['X-Plex-Token'] = store.getters.getSelectedServerToken;
        await axios({
            method: 'post',
            url: url,
            headers: header
          })
            .then((response) => {
              log.debug('Response from createDVR recieved');
              log.silly(`DVR Created as: ${JSON.stringify(response.data)}`);
              if (JSONPath({path: '$.MediaContainer.size', json: response.data}) == 0)
              {
                dialog.ShowMsgBox(i18n.t("Modules.PMS.DVR.selDeviceAlreadyUsed"), 'error', i18n.t("Modules.PMS.DVR.selAlredyPresentTitle"), [i18n.t("Common.Ok")]);
              }
              else
              {
                log.info(`DVR Created with UUID: ${JSONPath({path: '$.MediaContainer.Dvr[0].uuid', json: response.data})}`);
                this.dvrKey = JSONPath({path: '$.MediaContainer.Dvr[0].key', json: response.data});
                this.deviceKey = JSONPath({path: '$..Device[0].key', json: response.data});
                log.info(`DVR Created with Key: ${this.dvrKey}`);
                this.setDvrPrefs();
                this.setDevicePrefs();
                this.setDeviceMapping();
              }


            })
            .catch(function (error) {
              if (error.response) {
                  log.error('createDVR: ' + error.response.data);
                  alert(error.response.data.errors[0].code + " " + error.response.data.errors[0].message);
              } else if (error.request) {
                  log.error('createDVR: ' + error.request);
              } else {
                  log.error('createDVR: ' + error.message);
            }
        });


        console.log('Ged 57: ' + JSON.stringify(url))


    }

    async restoreDVR (){
        log.info(`DVR Restore started`);
        await this.getDVRList();
        const filters = [{name: 'DVR Backups', extensions: ['json']}];
        const path = require('path');
        const defaultPath = path.join(wtconfig.get('General.ExportPath'), 'Plex Media Server', 'DVR', '\\');
        const selectFile = dialog.SelectFile( i18n.t("Modules.PMS.DVR.selRestoreFile"), i18n.t("Common.Ok"), filters, defaultPath);
        if (selectFile)
        {
            log.info(`Selected restore file is: ${selectFile}`);
            var fs = require('fs');
            this.fileDVRRestore = JSON.parse(fs.readFileSync(selectFile[0], 'utf8'));
            log.silly(`DVR Backup file contents`);
            log.silly(JSON.stringify(this.fileDVRRestore));
            const dvrTitle = String(JSONPath({path: '$.lineupTitle', json: this.fileDVRRestore}));
            //const msgBody = i18n.t("Modules.PMS.DVR.restoreMsg", [dvrTitle]);
            if ( dialog.ShowMsgBox(i18n.t("Modules.PMS.DVR.restoreMsg", [dvrTitle]), 'question', i18n.t("Modules.PMS.DVR.confirmRestore"), [i18n.t("Common.Ok"), i18n.t("Common.Cancel")]) == 0 )
            {
                // Check if DVR to restore is already present
                if ( JSON.stringify(this.dvrList).indexOf(dvrTitle) > -1 )
                {
                    log.error(`Selected dvr was "${dvrTitle}" but is was already present on the PMS`)
                    dialog.ShowMsgBox(i18n.t("Modules.PMS.DVR.selAlredyPresentMsg", [dvrTitle]), 'error', i18n.t("Modules.PMS.DVR.selAlredyPresentTitle"), [i18n.t("Common.Ok")]);
                }
                else
                {
                    log.info('Starting DVR Restore');
                    // Let's get the amount of devices
                    const deviceCount = JSONPath({path: '$..Device.length', json: this.fileDVRRestore});
                    if ( deviceCount < 1){
                        dialog.ShowMsgBox(i18n.t("Modules.PMS.DVR.selMissingDevice", [dvrTitle]), 'error', i18n.t("Modules.PMS.DVR.selAlredyPresentTitle"), [i18n.t("Common.Ok")]);
                        log.error('No devices found in backup file')
                    }
                    else
                    {
                        this.createDVR();
                    }
                }
            }
        }
        else
        {
            log.info(`No files selected`);
        }
    }

    async backupDVR( { dvrName } ){
        let fileName = await this.getFileName( {'dvrName': dvrName} );
        const fs = require('fs');
        let data = await this.getDVR( dvrName );
        fs.writeFileSync(fileName, JSON.stringify(data, null, 2));
        store.commit('UPDATE_doneDVRBackup', fileName);
        log.debug(`DVR backedup to ${fileName}`);
    }

    async getDVR( uuid ){
        let DVRs = store.getters.getDVRs;
        let retVal='';
        DVRs.forEach( dvr => {
            if (dvr['uuid']==uuid){
                retVal = dvr;
            }
        })
        return retVal;
    }

    async getDVRName( { uuid } ){
        let DVRs = store.getters.getDVRs;
        let retVal='';
        DVRs.forEach( dvr => {
            if (dvr['uuid']==uuid){
                retVal = dvr['lineupTitle'];
            }
        })
        return retVal;
    }

    async getFileName( { dvrName } ){
        /*
            Will create the output directory if it doesn't exists
            Will return a string with the filename to use
        */
        const realDVRName = await this.getDVRName( { 'uuid': dvrName })
        const path = require('path');
        const Module = path.join('Plex Media Server', 'DVR');
        const dateFormat = require('dateformat');
        const OutDir = wtconfig.get('General.ExportPath');
        const timeStamp=dateFormat(new Date(), "yyyy.mm.dd_h.MM.ss");
        let outFile = store.getters.getSelectedServer['name'] + '_' + realDVRName + '_' + timeStamp + '.json';
        const targetDir = path.join(
            OutDir, wtutils.AppName, Module);
        const outFileWithPath = path.join(
            targetDir, outFile);
        // Make sure target dir exists
        const fs = require('fs')
        if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
        }
        log.info(`OutFile is ${outFileWithPath}`)
        return outFileWithPath;
    }
}


export { dvr };