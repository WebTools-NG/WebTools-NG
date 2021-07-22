// This file holds generic et functions


import { wtconfig, wtutils } from '../../General/wtutils';
import store from '../../../../store';
import {csv} from './csv';
import {et} from './et';
import i18n from '../../../../i18n';
//import i18n from '../../../../i18n';

const log = require('electron-log');
console.log = log.log;

var def;



//#region *** Internal functions ****


function isEmpty(obj) {
    return !Object.keys(obj).length > 0;
  }

//#endregion

const etHelper = new class ETHELPER {
    // Private Fields
    #_FieldHeader = [];
    #_StartTime = null;
    #_EndTime = null;
    #_statusmsg = {};
    #_RawMsgType = {
        'Status': 1,
        'Info': 2,
        'Chuncks': 3,
        'Items': 4,
        'OutFile': 5,
        'StartTime': 6,
        'EndTime': 7,
        'TimeElapsed': 8,
        'RunningTime': 9
    };
    #_msgType = {
        1: i18n.t("Modules.ET.Status.Names.Status"),
        2: i18n.t("Modules.ET.Status.Names.Info"),
        3: i18n.t("Modules.ET.Status.Names.Chuncks"),
        4: i18n.t("Modules.ET.Status.Names.Items"),
        5: i18n.t("Modules.ET.Status.Names.OutFile"),
        6: i18n.t("Modules.ET.Status.Names.StartTime"),
        7: i18n.t("Modules.ET.Status.Names.EndTime"),
        8: i18n.t("Modules.ET.Status.Names.TimeElapsed"),
        9: i18n.t("Modules.ET.Status.Names.RunningTime")
    }

    constructor() {
        this.Settings = {
            LibName: null,
            Level: null,
            libType: null,
            libTypeSec: null,
            selLibKey: null,
            outFile: null,
            baseURL: null,
            accessToken: null,
            levelName: null
        };
        this.uriParams = 'checkFiles=1&includeAllConcerts=1&includeBandwidths=1&includeChapters=1&includeChildren=1&includeConcerts=1&includeExtras=1&includeFields=1&includeGeolocation=1&includeLoudnessRamps=1&includeMarkers=1&includeOnDeck=1&includePopularLeaves=1&includePreferences=1&includeRelated=1&includeRelatedCount=1&includeReviews=1&includeStations=1';
        this.#_FieldHeader = [];
        this.ETmediaType = {
            Movie: 1,
            Show: 2,
            Season: 3,
            Episode: 4,
            Trailer: 5,
            Comic: 6,
            Person: 7,
            Artist: 8,
            Album: 9,
            Track: 10,
            Clip: 12,
            Photo: 13,
            Photo_Album: 14,
            Playlist: 15,
            Playlist_Folder: 16,
            Podcast: 17,
            Library: 1001,
            Libraries: 1002,
            Playlist_Audio: 2001,
            Playlist_Video: 2002,
            Playlist_Photo: 2003,
            Playlists: 3001
        };
        this.RevETmediaType = {
            1: 'Movie',
            2: 'Show',
            3: 'Season',
            4: 'Episode',
            5: 'Trailer',
            6: 'Comic',
            7: 'Person',
            8: 'Artist',
            9: 'Album',
            10: 'Track',
            12: 'Clip',
            13: 'Photo',
            14: 'Photo_Album',
            15: 'Playlist',
            16: 'Playlist_Folder',
            17: 'Podcast',
            1001: 'Library',
            1002: 'Libraries',
            2001: 'Audio',
            2002: 'Video',
            2003: 'Photo',
            3001: 'Playlists'
        };
    }

    async exportMedias() {
        this.updateStatusMsg( this.#_RawMsgType.Status, i18n.t("Modules.ET.Status.Running"));
        this.updateStatusMsg( this.#_RawMsgType.StartTime, await this.getNowTime('start'));
        //this.Settings.libName = et.getLibDisplayName(this.Settings.selLibKey, store.getters.getPmsSections);
        if ([ et.ETmediaType.Libraries, et.ETmediaType.Playlists].indexOf(this.Settings.libType) > -1)
        {
            this.Settings.levelName = 'All'
        }
/* 
        else
        {
            this.Settings.levelName = et.getLevelDisplayName(this.Settings.exportLevel, this.Settings.libType);
        }
         */
        await this.createOutFile();
        // Update status window
        this.clearStatus();
        this.updateStatusMsg( this.#_RawMsgType.Status, i18n.t("Modules.ET.Status.Finished"));
        this.updateStatusMsg( this.#_RawMsgType.StartTime, await this.getStartEndTime('start'));
        this.getNowTime('end');
        this.updateStatusMsg( this.#_RawMsgType.EndTime, await this.getStartEndTime('end'));
        this.updateStatusMsg( this.#_RawMsgType.TimeElapsed, await this.getTimeElapsed());
        //this.updateStatusMsg( this.#_RawMsgType.OutFile, et.OutFile.split('.').slice(0, -1).join('.'));
        this.updateStatusMsg( this.#_RawMsgType.OutFile, this.Settings.OutFile);
    }

    async createOutFile()
    {
        // Now we need to find out how many calls to make
        const call = await et.getLevelCall(this.Settings.libType, this.Settings.level);
        // Open a file stream
        const tmpFile = await etHelper.getFileName({ Type: 'csv' })
        var fs = require('fs');
        var stream = fs.createWriteStream(tmpFile, {flags:'a'});

        var sectionData, x;
        {
            sectionData, x

            await etHelper.getAndSaveItemsToFile({stream: stream, call: call});
 /*            
            // Get all the items in small chuncks
            sectionData = await et.getSectionData();

            log.verbose(`Amount of chunks in sectionData are: ${sectionData.length}`);
            let item;
            let counter = 1;
            const totalSize = JSONPath({path: '$..totalSize', json: sectionData[0]});
            let jPath, sectionChunk;
            // We need to load fields and defs into def var
            switch(libType) {
                case et.ETmediaType.Libraries:
                    jPath = "$.MediaContainer.Directory[*]";
                    break;
                default:
                    jPath = "$.MediaContainer.Metadata[*]";
            }
            const bExportPosters = wtconfig.get(`ET.CustomLevels.${et.expSettings.libTypeSec}.Posters.${et.expSettings.levelName}`, false);
            const bExportArt = wtconfig.get(`ET.CustomLevels.${et.expSettings.libTypeSec}.Art.${et.expSettings.levelName}`, false);
            
            for (x=0; x<sectionData.length; x++)
            {
                et.updateStatusMsg(et.rawMsgType.Chuncks, i18n.t('Modules.ET.Status.Processing-Chunk', {current: x, total: sectionData.length -1}));
                sectionChunk = await JSONPath({path: jPath, json: sectionData[x]});
                const fields = et.getFields( libType, level);
                if ( call == 1 )
                {
                    for (item of sectionChunk){
                        et.updateStatusMsg(et.rawMsgType.Items, i18n.t('Modules.ET.Status.ProcessItem', {count: counter, total: totalSize}));
                        await excel2.addRowToTmp( { libType: libType, level: level, data: item, stream: stream, fields: fields } );
                        if (bExportPosters)
                        {
                            await this.exportPics( { type: 'posters', data: item, baseURL: baseURL, accessToken: accessToken } )
                        }
                        if (bExportArt)
                        {
                            await this.exportPics( { type: 'arts', data: item, baseURL: baseURL, accessToken: accessToken } )
                        }
                        counter += 1;
                        await new Promise(resolve => setTimeout(resolve, 1));
                    }
                }
                else
                {
                    // Get ratingKeys in the chunk
                    const urls = await JSONPath({path: '$..ratingKey', json: sectionChunk});
                    let urlStr = urls.join(',');
                    log.verbose(`Items to lookup are: ${urlStr}`);
                    et.updateStatusMsg(et.rawMsgType.Chuncks, i18n.t('Modules.ET.Status.Processing-Chunk', {current: x, total: sectionData.length -1}));
                    const urlWIthPath = '/library/metadata/' + urlStr + '?' + this.uriParams;
                    log.verbose(`Items retrieved`);
                    const contents = await et.getItemData({baseURL: baseURL, accessToken: accessToken, element: urlWIthPath});
                    const contentsItems = await JSONPath({path: '$.MediaContainer.Metadata[*]', json: contents});
                    for (item of contentsItems){
                        et.updateStatusMsg(et.rawMsgType.Items, i18n.t('Modules.ET.Status.ProcessItem', {count: counter, total: totalSize}));
                        if (bExportPosters)
                        {
                            await this.exportPics( { type: 'posters', data: item, baseURL: baseURL, accessToken: accessToken } )
                        }
                        if (bExportArt)
                        {
                            await this.exportPics( { type: 'arts', data: item, baseURL: baseURL, accessToken: accessToken } )
                        }
                        await excel2.addRowToTmp( { libType: libType, level: level, data: item, stream: stream, fields: fields } );
                        counter += 1;
                        await new Promise(resolve => setTimeout(resolve, 1));
                    }
                }
            }
 */

        }
        stream.end();
        // Rename to real file name
        var newFile = tmpFile.replace('.tmp', '')
        fs.renameSync(tmpFile, newFile);
/* 
        // Need to export to xlsx as well?
        if (wtconfig.get('ET.ExpExcel')){
            log.info('We need to create an xlsx file as well');
            et.updateStatusMsg( et.rawMsgType.Info, i18n.t('Modules.ET.Status.CreateExlsFile'));
            await excel2.createXLSXFile( {csvFile: newFile, level: level, libType: libType, libName: libName, exType: exType, pListType: pListType});
        }
         */
    }

    async getAndSaveItemsToFile({stream: stream, call: call})
    {
        call
        const fields = await etHelper.getFieldHeader();
        if (wtconfig.get("ET.ExpCSV", true)){
            //await this.getFileName({ Library: libName, Level: level, Type: 'tmp', Module: i18n.t('Modules.ET.Name'), exType: exType });
            await csv.addHeaderToTmp({ stream: stream, item: fields});
        }
        if (wtconfig.get("ET.ExpExcel", false)){
            //await csv.addHeaderToTmp({ stream: stream, item: fields});
            // TODO: Add XLS Header
        }

        log.debug(`Got level as: ${etHelper.Settings.Level} and libType as: ${etHelper.Settings.libType}`)

        // Get element and postURI
        const element = etHelper.getElement();
        const postURI = etHelper.getPostURI();
        

        element, postURI

        



/*         
        // Current item
        let idx = 0
        // Now let's walk the section
        let chuncks, postURI, size, element, item

        chuncks, element, postURI
        // get element and portURI
        
        do {
            log.info(`Calling getSectionData url ${this.expSettings.baseURL + element + postURI + idx}`);
            chuncks = await et.getItemData({baseURL: this.expSettings.baseURL, accessToken: this.expSettings.accessToken, element: element, postURI: postURI + idx});
            size = JSONPath({path: '$.MediaContainer.size', json: chuncks});
            const totalSize = JSONPath({path: '$.MediaContainer.totalSize', json: chuncks});
            log.info(`getSectionData chunck size is ${size} and idx is ${idx} and totalsize is ${totalSize}`)
            // et.updateStatusMsg(et.rawMsgType.Info, i18n.t('Modules.ET.Status.GetSectionItems', {idx: idx, chunck: size, totalSize: totalSize}))
            et.updateStatusMsg(et.rawMsgType.Info, i18n.t('Modules.ET.Status.GetSectionItems', {chunck: step, totalSize: totalSize}))
            // Inc our step/idx
            idx += step;
            log.silly(`Chunks returned as: ${JSON.stringify(chuncks)}`);
            let chunckMedia = JSONPath({path: '$.MediaContainer.Metadata[*]', json: chuncks});
            log.silly(`chunckMedia returned as: ${JSON.stringify(chunckMedia)}`);
            try{
                if (call == 1)
                {
                    // We don't need to call each media, so simply add to output
                    console.log('Ged 2 single call')
                    for (item of chunckMedia){
                        log.silly(`Item is: ${JSON.stringify(item)}`);
                        //et.updateStatusMsg(et.rawMsgType.Items, i18n.t('Modules.ET.Status.ProcessItem', {count: counter, total: totalSize}));
                        //await excel2.addRowToTmp( { libType: this.expSettings.libType, level: this.expSettings.exportLevel, data: item, stream: stream, fields: fields } );
                        console.log('Ged 33 start CSV')
                        await csv.addRowToTmp({ stream: stream, item: item});
                        console.log('Ged 33-1 end CSV')
                    }

                }else{
                    // We need to call the individual medias to get all the info
                    console.log('Ged 3 multiple calls')
                }
            }
            catch (error)
            {
                log.error(`Exception in et.js getAndSaveItemsToFile was: ${error}`)
            }
        } while (size > 1);

 */
        

    }

    // Generate the filename for an export
    async getFileName({ Type }){
        const dateFormat = require('dateformat');
        const OutDir = wtconfig.get('General.ExportPath');
        const timeStamp=dateFormat(new Date(), "yyyy.mm.dd_h.MM.ss");
        const path = require('path');
        let outFile = store.getters.getSelectedServer.name + '_';
        outFile += this.Settings.LibName + '_';
        outFile += this.RevETmediaType[this.Settings.libType.toString()] + '_';
        outFile += this.Settings.levelName + '_';
        console.log('Ged 554400-1: ' + this.Settings.levelName)
        outFile += timeStamp + '.' + Type + '.tmp';
        this.Settings.OutFile = outFile;
        const targetDir = path.join(
            OutDir, wtutils.AppName, i18n.t('Modules.ET.Name'));
        const outFileWithPath = path.join(
            targetDir, outFile);
        // Make sure target dir exists
        const fs = require('fs')
        if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir);
        }
        log.info(`OutFile is ${outFileWithPath}`);
        return outFileWithPath;
    }

    getElement(){
        let element
        switch (this.Settings.libType) {
            case this.ETmediaType.Photo:
                element = '/library/sections/' + this.selLibKey + '/all';
                break;
            case this.ETmediaType.Playlist:
                element = '/playlists/' + this.selLibKey;
                break;
            case this.ETmediaType.Libraries:
                element = '/library/sections/all';
                break;
            case this.ETmediaType.Playlists:
                element = '/playlists/all';
                break;
            default:
                element = '/library/sections/' + this.selLibKey + '/all';
        }
        log.debug(`Got element as ${element}`);
        return element;
    }

    getPostURI(){
        let postURI;
        // Find LibType steps
        const step = wtconfig.get("PMS.ContainerSize." + this.Settings.libType, 20);
        log.debug(`Got Step size as: ${step}`);
        switch (this.Settings.libType) {
            case this.ETmediaType.Photo:
                postURI = `?addedAt>>=-2208992400&X-Plex-Container-Size=${step}&type=${this.Settings.libTypeSec}&${this.uriParams}&X-Plex-Container-Start=`;
                break;
            case this.ETmediaType.Playlist:
                postURI = `/items?X-Plex-Container-Size=${step}&X-Plex-Container-Start=`;
                break;
            case this.ETmediaType.Libraries:
                postURI = `?X-Plex-Container-Size=${step}&X-Plex-Container-Start=`;
                break;
            case this.ETmediaType.Playlists:
                postURI = `?X-Plex-Container-Size=${step}&X-Plex-Container-Start=`;
                break;
            default:
                postURI = `?X-Plex-Container-Size=${step}&type=${this.Settings.libTypeSec}&${this.uriParams}&X-Plex-Container-Start=`;
        }
        log.debug(`Got postURI as ${postURI}`);
        return postURI;
    }

    async getLevelFields({level: level}) {
        // return fields in a level
        log.info('getLevelFields requested');
        return new Promise((resolve) => {
            const out = [];
            if (this.Settings.libType == et.ETmediaType.Playlist)
            {
                this.Settings.libType = et.expSettings.libTypeSec;
            }
            let realName = et.getRealLevelName(level, this.Settings.libType);
            log.debug(`RealName is ${realName}`);
            // We need to load fields and defs into def var
            switch(this.Settings.libType) {
                case et.ETmediaType.Movie:
                // code block
                def = JSON.parse(JSON.stringify(require('./../defs/def-Movie.json')));
                break;
                case et.ETmediaType.Episode:
                // code block
                def = JSON.parse(JSON.stringify(require('./../defs/def-Episode.json')));
                break;
                case et.ETmediaType.Show:
                    // code block
                    def = JSON.parse(JSON.stringify(require('./../defs/def-Show.json')));
                    break;
                case et.ETmediaType.Artist:
                    // code block
                    def = JSON.parse(JSON.stringify(require('./../defs/def-Artist.json')));
                    break;
                case et.ETmediaType.Track:
                    // code block
                    def = JSON.parse(JSON.stringify(require('./../defs/def-Track.json')));
                    break;
                case et.ETmediaType.Album:
                    // code block
                    def = JSON.parse(JSON.stringify(require('./../defs/def-Album.json')));
                    break;
                case et.ETmediaType.Photo:
                    // code block
                    def = JSON.parse(JSON.stringify(require('./../defs/def-Photo.json')));
                    break;
                case et.ETmediaType.Playlist_Audio:
                    // code block
                    def = JSON.parse(JSON.stringify(require('./../defs/def-Playlist-audio.json')));
                    break;
                case et.ETmediaType.Playlist_Photo:
                    // code block
                    def = JSON.parse(JSON.stringify(require('./../defs/def-Playlist-photo.json')));
                    break;
                case et.ETmediaType.Playlist_Video:
                    // code block
                    def = JSON.parse(JSON.stringify(require('./../defs/def-Playlist-video.json')));
                    break;
                case et.ETmediaType.Libraries:
                    def = JSON.parse(JSON.stringify(require('./../defs/def-LibraryInfo.json')));
                    break;
                case et.ETmediaType.Playlists:
                    def = JSON.parse(JSON.stringify(require('./../defs/def-PlaylistInfo.json')));
                    break;
                default:
                // code block
                log.error(`Unknown libtype: "${this.Settings.libType}" or level: "${level}" in "getLevelFields"`);
            }
            let levels = def[this.Settings.libType.toString()]['level'][realName];
            if (levels == undefined)
            {
                // We are dealing with a custom level
                levels = wtconfig.get(`ET.CustomLevels.${this.expSettings.libTypeSec}.level.${realName}`);
            }
            Object.keys(levels).forEach(function(key) {
                out.push(levels[key])
            });
            resolve(out);
        });
    }

    //#region *** StatusMsg ***
    clearStatus()
    {
        this.statusmsg = {};
        store.commit("UPDATE_SELECTEDETStatus", '');
    }

    async updateStatusMsg(msgType, msg)
    {
        console.log('Ged5544: ' + msgType + ' *-* ' + msg)
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
        store.commit("UPDATE_SELECTEDETStatus", newMsg);
    }

    //#endregion

    //#region *** Field Header ****

    // Public methode to get the Header
    async getFieldHeader() {
        log.info('FieldHeader requested');
        try{
            if (isEmpty(this.#_FieldHeader))
            {
                log.verbose(`Need to generate the header`);
                this.#_FieldHeader = await etHelper.#SetFieldHeader()
            }
            else
            {
                log.verbose(`Returning cached headers`);
            }
        }
        catch (error)
        {
            log.error(`Cought error in etHelper getFieldHeader as ${error}`);
        }
        log.verbose(`Field header is: ${JSON.stringify(this.#_FieldHeader)}`);
        return this.#_FieldHeader;
    }

    // Private methode to set the header
    async #SetFieldHeader(){
        log.verbose(`GetFieldHeader level: ${this.Settings.Level} - libType: ${this.Settings.libType}`);
        //const fields2 = await this.getLevelFields(this.Settings.Level);
        //return fields2;
        return await this.getLevelFields(this.Settings.Level);
    }
    //#endregion

    //#region *** Time ***
    async getTimeElapsed(){
        let elapsedSeconds = Math.floor((this.#_EndTime.getTime() - this.#_StartTime.getTime()) / 1000);
        let elapsedStr = elapsedSeconds.toString().replaceAll('.', '');
        const hours = Math.floor(parseFloat(elapsedStr) / 3600);
        elapsedSeconds = parseFloat(elapsedStr) - hours * 3600;
        const minutes = Math.floor(elapsedSeconds / 60);
        const seconds = elapsedSeconds - minutes * 60;
        return hours + ':' + minutes + ':' + seconds
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
        return hours + ':' + minutes + ':' + seconds;
    }

    async getStartEndTime(StartEnd){
        let now;
        if (StartEnd == 'start')
        {
            now = this.#_StartTime;
        }
        else
        {
            now = this.#_EndTime;
        }
        return now.getHours() + ':' + now.getMinutes() + ':' + now.getSeconds();
    }
    //#endregion
}

export { etHelper };