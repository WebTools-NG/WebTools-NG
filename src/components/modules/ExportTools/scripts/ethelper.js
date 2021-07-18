// This file holds generic et functions


import {wtconfig} from '../../General/wtutils';
//import {csv} from './csv';
import {et} from './et';
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
    #_FieldHeader = []

    constructor() {
        this.Settings = {
            Level: null,
            libType: null,
            libTypeSec: null,
            selLibKey: null
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

/* 

    async getAndSaveItemsToFile({stream: stream, call: call})
    {
        stream, call
        // Find LibType steps
        const step = wtconfig.get("PMS.ContainerSize." + this.expSettings.libType, 20);
        log.debug(`Got Step size as: ${step}`);
        // Now read the fields and level defs
        const fields = et.getFields( this.expSettings.libType, this.expSettings.exportLevel);
        fields
        // Current item
        let idx = 0
        // Now let's walk the section
        let chuncks, postURI, size, element, item

        chuncks, element, postURI
        // get element and portURI
        switch (this.expSettings.libType) {
            case et.ETmediaType.Photo:
                element = '/library/sections/' + this.expSettings.selLibKey + '/all';
                postURI = `?addedAt>>=-2208992400&X-Plex-Container-Size=${step}&type=${this.expSettings.libTypeSec}&${this.uriParams}&X-Plex-Container-Start=`;
                break;
            case et.ETmediaType.Playlist:
                element = '/playlists/' + this.expSettings.selLibKey;
                postURI = `/items?X-Plex-Container-Size=${step}&X-Plex-Container-Start=`;
                break;
            case et.ETmediaType.Libraries:
                element = '/library/sections/all';
                postURI = `?X-Plex-Container-Size=${step}&X-Plex-Container-Start=`;
                break;
            case et.ETmediaType.Playlists:
                element = '/playlists/all';
                postURI = `?X-Plex-Container-Size=${step}&X-Plex-Container-Start=`;
                break;
            default:
                element = '/library/sections/' + this.expSettings.selLibKey + '/all';
                postURI = `?X-Plex-Container-Size=${step}&type=${this.expSettings.libTypeSec}&${this.uriParams}&X-Plex-Container-Start=`;
        }
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
    }

     */

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
}

export { etHelper };