// This file holds generic FM functions

const log = require('electron-log');
console.log = log.log;

const fs = require("fs");
const path = require("path");
const {JSONPath} = require('jsonpath-plus');

//var recursive = require("recursive-readdir");


//import { resolve } from 'core-js/fn/promise';
import store from '../../../../../store';
import { wtutils,wtconfig } from '../../../General/wtutils';
import { status } from '../../../General/status';
import i18n from '../../../../../i18n';
import { resolve } from 'path';
import axios from 'axios';

/*
Recursive scanning of a filepath
Takes dirPath and orgDirPath as parameter
for the starting dir. (Should be the same)
Will return an raw array, as well as populate
findMedia.filesFound array
*/
const getAllFiles = function( dirPath, orgDirPath, arrayOfFiles ) {
    var files = fs.readdirSync(dirPath);
    arrayOfFiles = arrayOfFiles || [];
    files.forEach(function(curFile) {
      if (fs.statSync(dirPath + "/" + curFile).isDirectory()) {
        arrayOfFiles = getAllFiles(path.join(dirPath, curFile), orgDirPath, arrayOfFiles)
      } else {
        if (findMedia.validExt.includes(path.extname(curFile).slice(1)))
        {
            arrayOfFiles.push(path.join(dirPath, curFile));
            log.silly(`[FindMedia.js] (getAllFiles) - Adding ${path.join(dirPath, curFile).slice(orgDirPath.length + 1)}: ${ path.join(dirPath, curFile) }`);
            findMedia.filesFound[path.join(dirPath, curFile).slice(orgDirPath.length + 1)] = path.join(dirPath, curFile);
        }
      }
    })
    return arrayOfFiles
  }


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
        this.ignoreExt = ["*.cs", "*.html", "*.mkvfixed", "*.srt", "*.metathumb"];
        this.currentLibPathLength;
        this.filesFound = {};
        this.libFiles = [];
        this.PMSLibPaths = [];
    }

    async findMedia( libpaths, libKey, libType ){


        console.log('Ged 54-4 libpaths: ' + libpaths)
        console.log('Ged 54-5 libkey: ' + libKey)
        console.log('Ged 54-6 libkey: ' + libType)

        status.updateStatusMsg( status.RevMsgType.Status, i18n.t('Common.Status.Msg.Processing'));
       // await findMedia.scanFileSystemPaths( libpaths );


        console.log('Ged 54-10: ' + this.filePath.length )

        console.log('Ged 54-11: ' + JSON.stringify( this.filesFound ) )

        await findMedia.scanPMSLibrary(libKey, libType);


        status.clearStatus();
        status.updateStatusMsg( status.RevMsgType.Status, i18n.t('Common.Status.Msg.Finished'));
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

    /// This will scan the filesystem for medias
    async scanFileSystemPaths( paths ){
        return new Promise((resolve) => {
            log.info(`[FindMedia.js] (scanFileSystemPaths) - Starting`);
            log.debug(`[FindMedia.js] (scanFileSystemPaths) - We will scan the following filePaths: ${ JSON.stringify(paths)}`);
            status.updateStatusMsg( status.RevMsgType.Info, 'GED Scanning FileSystem');
            // Reset output
            findMedia.filePath = [];
            const serverID = store.getters.getSelectedServer.clientIdentifier;
            //this.filePath = [];
            //Walk each paths
            paths.forEach(async libPath => {
                let mappedLibPath = wtconfig.get(`PMS.LibMapping.${serverID}.${libPath}`, 'WTNG_ERROR_WTNG');
                status.updateStatusMsg( status.RevMsgType.Info, `Now Scanning ${mappedLibPath}`);
                log.debug(`[FindMedia.js] (scanFileSystemPaths) - PMS path is: ${libPath}`);
                log.debug(`[FindMedia.js] (scanFileSystemPaths) - Wkstn path is: ${mappedLibPath}`);
                findMedia.filePath.push(...getAllFiles( mappedLibPath, mappedLibPath ));
            });
            log.info(`[FindMedia.js] (scanFileSystemPaths) - End`);
            resolve();
        });
    }

    /*
    This will scan the PMS library, and add result to this.libPaths,
    if not present in this.filePath.
    If present, then pop it from this.filePath
    */
   async scanPMSLibrary( library, libType ){
    log.info(`[FindMedia.js] (scanPMSLibrary) - Starting`);
    log.verbose(`[FindMedia.js] (scanPMSLibrary) - We will scan library with a key of: ${ library } and a type of: ${libType}`);
    status.updateStatusMsg( status.RevMsgType.Info, 'GED Scanning PMS Library');
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



//    step = wtconfig.get("PMS.ContainerSize." + mediaType, 20);
    step = 4;

    console.log('Ged 10-6 step: ' + step)

    let metaData;




    do {
        url = `${store.getters.getSelectedServerAddress}/library/sections/${library}/all?excludeElements=Genre,Director,Writer,Country,Role,Producer,Collections&excludeFields=summary,tagline,rating,contentRating,audienceRatingImage&X-Plex-Container-Start=${index}&X-Plex-Container-Size=${step}&type=${mediaType}`;
        console.log('Ged 77-1 index: ' + index)
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
                    //console.log('Ged 13-3 media: ' + JSON.stringify(metaData[parseInt(x)]))

                    var title = JSONPath({path: `$..title`, json: metaData[parseInt(idxMetaData)]})[0];
                    var files = JSONPath({path: `$..Part[*].file`, json: metaData[parseInt(idxMetaData)]});
                    console.log('Ged 13-5 title: ' + title)
//                    console.log('Ged 13-6 files: ' + files)
                    for (var idxFiles in files){
                        console.log('Ged 13-4 file: ' + files[idxFiles])

                        console.log('Ged 11-2 path.length: ' + this.PMSLibPaths.length)
                        for (var idxPMSLibPaths in this.PMSLibPaths){
                            console.log('Ged 11-3 path: ' + this.PMSLibPaths[idxPMSLibPaths])
                        }
                        
 

                    }

                    

                }
                index += step;
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

        console.log('Ged 99-20: ' + size + ' * ' + step)
    } while ( size == step );

    

    





    console.log('Ged 99-30 LibFiles: ' + JSON.stringify(findMedia.libFiles))
    log.info(`[FindMedia.js] (scanPMSLibrary) - End`);
    resolve();
   }

   /*
   This will populate this.PMSLibPaths
   with an array of library paths used
   */
   async getPMSPathArr(){
    // Reset property
    this.PMSLibPaths = [];
    // Start by getting Server ID
    const serverID = store.getters.getSelectedServer.clientIdentifier;
    // Now lookup defined mappings, so we can add them to the array
    let mappedLibPaths = wtconfig.get(`PMS.LibMapping.${serverID}`, 'WTNG_ERROR_WTNG');
    //this.PMSLibPaths.push(Object.keys(mappedLibPaths));
    console.log('Ged 7-3 mappedLibPaths: ' + mappedLibPaths)
    console.log('Ged 7-4 keys: ' + Object.keys(mappedLibPaths))
    for (var idxPath in Object.keys(mappedLibPaths)){
        console.log('Ged 7-10 item: ' + Object.keys(mappedLibPaths)[idxPath])
    }
    this.PMSLibPaths.push(Object.keys(mappedLibPaths).split(","));
    resolve();
   }



}

export { findMedia };