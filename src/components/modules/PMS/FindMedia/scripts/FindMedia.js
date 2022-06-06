// This file holds generic FM functions

const log = require('electron-log');
console.log = log.log;

const fs = require("fs");
const path = require("path");

import store from '../../../../../store';
import { wtconfig } from '../../../General/wtutils';

const findMedia = new class FINDMEDIA {
    constructor() {
        this.validExt = [
            '3g2','3gp','asf','asx','avc','avi','avs','bivx','bup','divx','dv','dvr-ms',
            'evo','fli','flv','m2t','m2ts','m2v','m4v',
            'mkv','mov','mp4','mpeg','mpg','mts','nsv','nuv','ogm','ogv','tp','pva','qt','rm','rmvb','sdp','svq3',
            'strm','ts','ty','vdr','viv','vob','vp3','wmv','wpl','wtv','xsp','xvid','webm'
        ];
        this.libPaths = [];
        this.filePath = [];
    }

    /*
    This will check paths if mapped
    will return 'ok' if all is good, or
    else the path that needs a mapping
    */
    async checkPathMapping( paths ){
        return new Promise((resolve) => {
            let gotError = false;
            log.info(`[FindMedia.js] (checkPathMapping) Starting`);
            log.verbose(`[FindMedia.js] (checkPathMapping) We will check the following filePaths: ${ JSON.stringify(paths)}`);
            // First we need to check if libPath Mappings has been defined, and if not, alert user
            // To do this, we need the selected servers ID
            // Get ServerID
            let retVal = 'ok'
            const serverID = store.getters.getSelectedServer.clientIdentifier;
            paths.forEach(libPath => {
                let mappedLibPath = wtconfig.get(`PMS.LibMapping.${serverID}.${libPath}`, 'WTNG_ERROR_WTNG');
                if ( mappedLibPath === 'WTNG_ERROR_WTNG'){
                    log.error(`[FindMedia.js] (checkPathMapping) - missing: ${libPath}`);
                    gotError = true;
                }
            });
            log.info(`[FindMedia.js] (checkPathMapping) All done`);
            if ( gotError){
                retVal = 'WTNG_ERROR_WTNG';
            }
            resolve (retVal);
        });

    }

    /*
    Reqursive scanning of a filepath
    Takes dirPath as parameter
    Will store output in this.filePath
    */
        doScanPath( dirPath, arrayOfFiles ){
        //return new Promise((resolve) => {

            console.log('Ged 13-0 start')
            console.log('Ged 13-1 dirPath: ' + dirPath)
            console.log('Ged 13-2 arrayOfFiles: ' + arrayOfFiles)

            
            






            fs, path

    //        resolve();
    //    });

    }

    /// This will scan the filesystem for medias
    async scanFileSystemPaths( paths ){
        return new Promise((resolve) => {
            log.info(`[FindMedia.js] (scanFileSystemPaths) - Starting`);
            log.debug(`[FindMedia.js] (scanFileSystemPaths) - We will scan the following filePaths: ${ JSON.stringify(paths)}`);
            let retVal = [];
            // Reset output
            this.filePath = [];
            // First we need to check if libPath Mappings has been defined, and if not, alert user
            // To do this, we need the selected servers ID
            // Get ServerID
            const serverID = store.getters.getSelectedServer.clientIdentifier;
            // Check that all paths are mapped
            paths.forEach(libPath => {
                let mappedLibPath = wtconfig.get(`PMS.LibMapping.${serverID}.${libPath}`, 'WTNG_ERROR_WTNG');
                log.debug(`[FindMedia.js] (scanFileSystemPaths) - PMS path is: ${libPath}`);
                log.debug(`[FindMedia.js] (scanFileSystemPaths) - Wkstn path is: ${mappedLibPath}`);
                this.filePath.push('Gummiged')
                this.doScanPath( mappedLibPath, this.filePath );
                console.log('Ged 55: ' + JSON.stringify( this.filePath ))


            });

            resolve(retVal);
        });



    }



}

export { findMedia };