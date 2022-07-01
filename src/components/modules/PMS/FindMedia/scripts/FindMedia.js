// This file holds generic FM functions

const log = require('electron-log');
console.log = log.log;

const fs = require("fs");
const path = require("path");
const {JSONPath} = require('jsonpath-plus');
var sanitize = require("sanitize-filename");

import store from '../../../../../store';
import { wtutils,wtconfig } from '../../../General/wtutils';
import { status } from '../../../General/status';
import i18n from '../../../../../i18n';
import { resolve } from 'path';
import axios from 'axios';
import {csv} from '../../../ExportTools/scripts/csv';


const validDir = function( dirName ) {
    /* Will check if directory is not hidden or should be ignored
       returns true or false */
    log.silly(`[FindMedia.js] (validDir) - Checking if ${dirName} is valid`);

    // Got a hidden one?
    if ( wtconfig.get('PMS.FindMedia.Settings.IgnoreHidden') ){
        if ( dirName.startsWith('.') ){
            log.silly(`[FindMedia.js] (validDir) - We do not allow hidden dirs like: ${dirName}`);
            return false;
        }
    }
    // Got an Extra dir?
    if ( wtconfig.get('PMS.FindMedia.Settings.IgnoreExtras', true) ){
        if ( findMedia.ExtraDirs.includes( dirName )){
            log.silly(`[FindMedia.js] (validDir) - We do not allow extra dirs like: ${dirName}`);
            return false;
        }
    }
    // Got a dir to ignore?
    if ( findMedia.settingsIgnoreDirs.includes( dirName.toLowerCase() ) ){
        log.silly(`[FindMedia.js] (validDir) - We do not allow ignore dirs like: ${dirName}`);
        return false;
    }
    log.silly(`[FindMedia.js] (validDir) - ${dirName} is valid`);
    return true;
}

const validFile = function( fileName ) {
    /* Will check if file is valid or not
       returns true or false */
    log.silly(`[FindMedia.js] (validFile) - Checking file: ${fileName}`)
    if ( findMedia.validExt.includes(path.extname(fileName).toLowerCase().slice(1))){
        log.silly(`[FindMedia.js] (validFile) - Valid ext for file: ${fileName}`);
        // Got a hidden one?
        if ( wtconfig.get('PMS.FindMedia.Settings.IgnoreHidden') ){
            if ( fileName.startsWith('.') ){
                log.silly(`[FindMedia.js] (validFile) - We do not allow hidden files like: ${fileName}`);
                return false;
            }
        }
        // Ignore extras
        if ( wtconfig.get('PMS.FindMedia.Settings.IgnoreExtras', true) ){
            log.silly(`[FindMedia.js] (validFile) - Checking IgnoreExtras for file: ${fileName}`)
            for (let eFile of findMedia.Extrafiles) {
                if ( path.parse(fileName).name.endsWith(eFile) ){
                    log.silly(`[FindMedia.js] (validFile) - We ignore extra file: ${fileName}`)
                    return false;
                }
            }
            //return true;
        } // else { return true }
        log.debug(`[FindMedia.js] (validFile) - *** Valid file found: ${fileName} ***`)
        return true;

    } else {
        log.silly(`[FindMedia.js] (validFile) - Ext not valid for file: ${fileName}`)
        return false
    }
}

const getAllFiles = function( dirPath, orgDirPath, arrayOfFiles ) {
    /*
        Recursive scanning of a filepath
        Takes dirPath and orgDirPath as parameter
        for the starting dir. (Should be the same)
        Will return an raw array, as well as populate
        findMedia.filesFound array
    */
        var files = fs.readdirSync(dirPath);
        // Set array if needed
        arrayOfFiles = arrayOfFiles || [];
        files.forEach(function(curFile) {
            // Is this a directory?
            if (fs.statSync(dirPath + "/" + curFile).isDirectory()) {
                // Check if valid dir, then call req.
                if ( validDir( curFile ) ){
                    arrayOfFiles = getAllFiles(path.join(dirPath, curFile), orgDirPath, arrayOfFiles)
                }
            } else {
                // We found a file
                if ( validFile( curFile ) ){
                    // Force forward slash
                    let lookupPath = path.join(dirPath, curFile).replaceAll('\\', '/');
                    log.silly(`[FindMedia.js] (getAllFiles) - Adding ${lookupPath.slice(orgDirPath.length + 1)}: ${ path.join(dirPath, curFile) }`);
                    findMedia.filesFound[lookupPath.slice(orgDirPath.length + 1)] = path.join(dirPath, curFile);
                }
            }
        })

    return arrayOfFiles
}

const findMedia = new class FINDMEDIA {
    constructor() {
        // Defaults for ext
        this.defValidExt = [
            '3g2','3gp','asf','asx','avc','avi','avs','bivx','bup','divx','dv','dvr-ms',
            'evo','fli','flv','m2t','m2ts','m2v','m4v',
            'mkv','mov','mp4','mpeg','mpg','mts','nsv','nuv','ogm','ogv','tp','pva','qt','rm','rmvb','sdp','svq3',
            'strm','ts','ty','vdr','viv','vob','vp3','wmv','wpl','wtv','xsp','xvid','webm'
        ];
        // Extra dirs
        this.ExtraDirs = [
            'Behind The Scenes', 'Deleted Scenes', 'Featurettes',
            'Interviews', 'Scenes', 'Shorts', 'Trailers', 'Other'
        ];
        // Extra files
        this.Extrafiles = [
            '-behindthescenes', '-deleted', '-featurette',
            '-interview', '-scene', '-short', '-trailer', '-other'
        ];
        this.ignoreDirs = [
            'lost+found'
        ];
        this.filePath = [];                 // Tmp store
        this.validExt = [];                 // Valid ext to use
        this.filesFound = {};               // files from FS to be included in result
        this.libFiles = [];                 // files from PMS to be included in result
        this.PMSLibPaths = [];              // All PMS Library paths (Wkstn)
        this.csvFile = '';                  // Filename for output file
        this.csvStream;                     // Output stream
        this.settingsIgnoreDirs;            // Directories to ignore
    }

    // Generate the filename for an export
    async getFileName({ Type, libKey }){
        const dateFormat = require('dateformat');
        const OutDir = wtconfig.get('General.ExportPath');
        const timeStamp = dateFormat(new Date(), "yyyy.mm.dd_h.MM.ss");
        const path = require('path');
        let arrFile = [];
        arrFile.push(store.getters.getSelectedServer.name);    //PMSName
        arrFile.push(JSONPath({path: `$.[?(@.key==${libKey})].title`, json: store.getters.getPmsSections}));    //libName
        arrFile.push(timeStamp + '.' + Type + '.tmp');
        let outFile = sanitize(arrFile.join('_'));
        const targetDir = path.join(OutDir, wtutils.AppName, i18n.t('Modules.PMS.Name'), i18n.t('Modules.PMS.FindMedia.Name'));
        const outFileWithPath = path.join(targetDir, outFile);
        // Make sure target dir exists
        const fs = require('fs')
        if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
        }
        log.info(`[FindMedia.js] (getFileName) - OutFile is: ${outFileWithPath}`);
        return outFileWithPath;
    }

    async makeOutFile( libKey ){
        let csvFile;
        const intSep = '{*WTNG-ET*}';
        // Get Header fields
        let fields = ['Title', 'PMS file', 'Filesystem'];
        var fs = require('fs');
        csvFile = await this.getFileName({ Type: 'csv', libKey: libKey });
        this.csvStream = fs.createWriteStream(csvFile, {flags:'a'});
        await csv.addHeaderToTmp({ stream: this.csvStream, item: fields});
        const NA = wtconfig.get('ET.NotAvail', 'N/A');
        // Add only on File System
        for(var key in this.filesFound){
            //console.log(key+": "+this.filesFound[key]);
            let row = NA + intSep + NA + intSep + this.filesFound[key];
            row = row.replaceAll(intSep, wtconfig.get("ET.ColumnSep", '|'));
            csv.addRowToTmp({ stream: this.csvStream, item: row});
        }
        // Add only in PMS
        for( key in this.libFiles){
            console.log( JSON.stringify(this.libFiles[key]));
            let row = this.libFiles[key]['title'] + intSep + this.libFiles[key]['file'] + intSep + NA;
            row = row.replaceAll(intSep, wtconfig.get("ET.ColumnSep", '|'));
            csv.addRowToTmp({ stream: this.csvStream, item: row});
        }
        // Close filestream
        this.csvStream.end();
        // Rename outFile to real name
        let newFile;
        newFile = csvFile.replace('.tmp', '')
        fs.renameSync(csvFile, newFile);
        return newFile;
    }

    async findMedia( libpaths, libKey, libType ){
        status.updateStatusMsg( status.RevMsgType.Status, i18n.t('Common.Status.Msg.Processing'));
        // Get settings needed
        this.validExt = await wtconfig.get('PMS.FindMedia.Settings.Ext', this.defValidExt);
        this.settingsIgnoreDirs = await wtconfig.get('PMS.FindMedia.Settings.ignoreDirs', this.ExtraDirs);
        log.info(`[FindMedia.js] (findMedia) - Starting FindMedia`);
        log.info(`[FindMedia.js] (findMedia) - Ignore Hidden files: ${wtconfig.get('PMS.FindMedia.Settings.IgnoreHidden', true)}`);
        log.info(`[FindMedia.js] (findMedia) - Ignore Extra files/Dirs: ${wtconfig.get('PMS.FindMedia.Settings.IgnoreExtras', true)}`);
        log.info(`[FindMedia.js] (findMedia) - Extra dirs to ignore: ${this.settingsIgnoreDirs}`);
        // Scan file system
        this.filesFound = [];
        await findMedia.scanFileSystemPaths( libpaths );
        // Scan library
        await findMedia.scanPMSLibrary(libKey, libType);
        // Create output file
        let outFile = await this.makeOutFile( libKey );
        status.clearStatus();
        status.updateStatusMsg( status.RevMsgType.Status, i18n.t('Common.Status.Msg.Finished'));
        status.updateStatusMsg( status.RevMsgType.OutFile, outFile);
    }

    async checkPathMapping( paths ){
        /*
        This will check paths if mapped
        will return 'ok' if all is good, or
        else the path that needs a mapping
        */
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
                // Escape . in libPath
                libPath = libPath.replace('.', '\\.');
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

    async scanFileSystemPaths( paths ){
        /// This will scan the filesystem for medias
        status.updateStatusMsg( status.RevMsgType.Info, i18n.t('Modules.PMS.FindMedia.ScanningFS'));
        await new Promise(resolve => setTimeout(resolve, 50));
        return new Promise((resolve) => {
            log.info(`[FindMedia.js] (scanFileSystemPaths) - Starting`);
            log.debug(`[FindMedia.js] (scanFileSystemPaths) - We will scan the following filePaths: ${ JSON.stringify(paths)}`);
            // Reset output
            findMedia.filePath = [];
            this.filesFound = {};
            const serverID = store.getters.getSelectedServer.clientIdentifier;
            //Walk each paths
            paths.forEach(async libPath => {
                let mappedLibPath = wtconfig.get(`PMS.LibMapping.${serverID}.${libPath.replace('.', '\\.')}`, 'WTNG_ERROR_WTNG');
                status.updateStatusMsg( status.RevMsgType.Info, `Now Scanning ${mappedLibPath}`);
                log.debug(`[FindMedia.js] (scanFileSystemPaths) - PMS path is: ${libPath}`);
                log.debug(`[FindMedia.js] (scanFileSystemPaths) - Wkstn path is: ${mappedLibPath}`);
                findMedia.filePath.push(...getAllFiles( mappedLibPath, mappedLibPath ));
            });
            log.info(`[FindMedia.js] (scanFileSystemPaths) - End`);
            resolve();
        });
    }

   async scanPMSLibrary( library, libType ){
    /*
        This will scan the PMS library, and add result to this.libFiles,
        if not present in this.filePath.
        If present, then pop it from this.filePath
    */
    log.info(`[FindMedia.js] (scanPMSLibrary) - Starting`);
    log.verbose(`[FindMedia.js] (scanPMSLibrary) - We will scan library with a key of: ${ library } and a type of: ${libType}`);
    status.updateStatusMsg( status.RevMsgType.Info, i18n.t('Modules.PMS.FindMedia.ScanningLib'));
    await findMedia.getPMSPathArr();
    findMedia.libFiles = [];
    // We need to find type of lib, and total count as well
    let index = 0;
    let step = 0;
    let size = 0;
    let totalSize = 0;
    let mediaType = 1;
    if ( libType === 'show'){
        mediaType = 4;
    }
    let url = `${store.getters.getSelectedServerAddress}/library/sections/${library}/all?excludeElements=Genre,Director,Writer,Country,Role,Producer,Collections&excludeFields=summary,tagline,rating,contentRating,audienceRatingImage&X-Plex-Container-Start=${index}&X-Plex-Container-Size=${step}&type=${mediaType}`
    let header = wtutils.PMSHeader;
    header['X-Plex-Token'] = store.getters.getSelectedServer.accessToken;
    await axios({
        method: 'get',
        url: url,
        headers: header
    })
        .then((response) => {
            log.debug('[FindMedia.js] (scanPMSLibrary) -  Response recieved');
            log.silly(`[FindMedia.js] (scanPMSLibrary) - Response returned as: ${JSON.stringify(response.data)}`);
            totalSize = JSONPath({path: `$.MediaContainer.totalSize`, json: response.data})[0];
            if ( JSONPath({path: `$.MediaContainer.viewGroup`, json: response.data})[0] === 'show'){
                mediaType = 4;
            }
        })
        .catch(function (error) {
        if (error.response) {
            log.error(`[FindMedia.js] (scanPMSLibrary) -  ${JSON.stringify(error.response.data)}`);
            alert(error.response.data.errors[0].code + " " + error.response.data.errors[0].message);
        } else if (error.request) {
            log.error(`[FindMedia.js] (scanPMSLibrary) -  ${JSON.stringify(error.request)}`);
        } else {
            log.error(`[FindMedia.js] (scanPMSLibrary) -  ${JSON.stringify(error.message)}`);
        }
    });
    step = wtconfig.get("PMS.ContainerSize." + mediaType, 20);
    let metaData;
    do {
        url = `${store.getters.getSelectedServerAddress}/library/sections/${library}/all?excludeElements=Genre,Director,Writer,Country,Role,Producer,Collections&excludeFields=summary,tagline,rating,contentRating,audienceRatingImage&X-Plex-Container-Start=${index}&X-Plex-Container-Size=${step}&type=${mediaType}`;
        status.updateStatusMsg( status.RevMsgType.Items, i18n.t('Common.Status.Msg.ProcessItem_0_1', {count: index, total: totalSize}));
        log.verbose(`[FindMedia.js] (scanPMSLibrary) - Calling url: ${ url } `);
        await axios({
            method: 'get',
            url: url,
            headers: header
        })
            .then((response) => {
                log.debug('[FindMedia.js] (scanPMSLibrary) -  Response recieved');
                log.silly(`[FindMedia.js] (scanPMSLibrary) - Response returned as: ${JSON.stringify(response.data)}`);
                size = JSONPath({path: `$.MediaContainer.size`, json: response.data})[0];
                metaData = JSONPath({path: `$.MediaContainer.Metadata`, json: response.data})[0];
                for (var idxMetaData in metaData)
                {
                    var title = JSONPath({path: `$..title`, json: metaData[parseInt(idxMetaData)]})[0];
                    var files = JSONPath({path: `$..Part[*].file`, json: metaData[parseInt(idxMetaData)]});
                    for (var idxFiles in files){
                        const pmsFile = files[idxFiles].replaceAll('\\', '/');
                        if (this.validExt.includes(path.extname(pmsFile).toLowerCase().slice(1))){
                            const libPathFound = this.getLibPath( files[idxFiles] );
                            var lookup = pmsFile.slice(libPathFound.length + 1);
                            if ( Object.prototype.hasOwnProperty.call(this.filesFound, lookup)) {
                                // We need to remove from detected files, since we found it
                                delete this.filesFound[lookup];
                            }
                            else {
                                // Not found, so only in PMS
                                let entry = {}
                                entry['title'] = title;
                                entry['file'] = files[idxFiles]
                                this.libFiles.push(entry);
                            }
                        }
                    }
                }
                index += step;
            })
            .catch(function (error) {
            if (error.response) {
                log.error(`[FindMedia.js] (scanPMSLibrary) -  ${JSON.stringify(error.response.data)}`);
                alert(error.response.data.errors[0].code + " " + error.response.data.errors[0].message);
                return
            } else if (error.request) {
                log.error(`[FindMedia.js] (scanPMSLibrary) -  ${JSON.stringify(error.request)}`);
                return
            } else {
                log.error(`[FindMedia.js] (scanPMSLibrary) -  ${JSON.stringify(error.message)}`);
                return
            }
        });
    } while ( size == step );
    log.info(`[FindMedia.js] (scanPMSLibrary) - End`);
    resolve();
   }

   getLibPath( fileName ){
    let foundPath = { };
    foundPath['found'] = [0, ""];
    for (var Idx in this.PMSLibPaths){
        if ( fileName.startsWith(this.PMSLibPaths[Idx])){
            const PMSLibPathsLength = this.PMSLibPaths[Idx].length;
            if ( PMSLibPathsLength > foundPath['found'][0] ){
                foundPath['found'] = [PMSLibPathsLength, this.PMSLibPaths[Idx]];
            }

        }
    }
    return foundPath['found'][1];
   }

   async getPMSPathArr(){
    /*
    This will populate this.PMSLibPaths
    with an array of library paths used
    */
    log.info(`[FindMedia.js] (getPMSPathArr) - Start`);
    // Reset property
    this.PMSLibPaths = [];
    // Start by getting Server ID
    const serverID = store.getters.getSelectedServer.clientIdentifier;
    // Now lookup defined mappings, so we can add them to the array
    let mappedLibPaths = wtconfig.get(`PMS.LibMapping.${serverID}`, 'WTNG_ERROR_WTNG');
    for (var idxPath in Object.keys(mappedLibPaths)){
        this.PMSLibPaths.push(Object.keys(mappedLibPaths)[idxPath]);
    }
    log.debug(`[FindMedia.js] (getPMSPathArr) - PMSLibPaths is ${this.PMSLibPaths}`);
    log.info(`[FindMedia.js] (getPMSPathArr) - End`);
    resolve();
   }
}

export { findMedia };