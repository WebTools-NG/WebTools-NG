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
        return arrDVR;       
        
    }

    async restoreDVR (){
        log.info(`DVR Restore started`);
        const filters = [{name: 'DVR Backups', extensions: ['json']}];
        const path = require('path');
        const defaultPath = path.join(wtconfig.get('General.ExportPath'), 'Plex Media Server', 'DVR', '\\');                
        const selectFile = dialog.SelectFile( i18n.t("Modules.PMS.DVR.selRestoreFile"), i18n.t("Common.Ok"), filters, defaultPath);
        if (selectFile)
        {
            log.info(`Selected restore file is: ${selectFile}`);
            var fs = require('fs');                      
            this.fileDVRRestore = JSON.parse(fs.readFileSync(selectFile[0], 'utf8'));    
            const dvrTitle = String(JSONPath({path: '$.lineupTitle', json: this.fileDVRRestore}));
            const msgBody = i18n.t("Modules.PMS.DVR.restoreMsg", [dvrTitle]);
            if ( dialog.ShowMsgBox(msgBody, 'question', i18n.t("Modules.PMS.DVR.confirmRestore"), [i18n.t("Common.Ok"), i18n.t("Common.Cancel")]) == 0 )
            {
                console.log('Ged 40 fortsæt')

                if ( await this.getDVRList().includes(dvrTitle) )
                {
                    console.log('Ged 45 already present')
                }

                

            }
        }
        else
        {
            log.info(`No files selected`);
        }

        console.log('Ged 70')



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