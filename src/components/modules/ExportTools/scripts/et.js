var def;
var defLevels = JSON.parse(JSON.stringify(require('./../defs/def-Levels.json')));
var defFields = JSON.parse(JSON.stringify(require('./../defs/def-Fields.json')));

const log = require('electron-log');
console.log = log.log;
const defpostURI = '?checkFiles=1&includeRelated=0&includeExtras=1&includeBandwidths=1&includeChapters=1'

import {wtconfig, wtutils} from '../../General/wtutils';
import i18n from '../../../../i18n';

import filesize from 'filesize';
var path = require("path");

const fetch = require('node-fetch');

const {JSONPath} = require('jsonpath-plus');
import axios from 'axios'
import store from '../../../../store';

const et = new class ET {
    constructor() {
        this.PMSHeader = wtutils.PMSHeader;
        this.uriParams = 'checkFiles=1&includeAllConcerts=1&includeBandwidths=1&includeChapters=1&includeChildren=1&includeConcerts=1&includeExtras=1&includeFields=1&includeGeolocation=1&includeLoudnessRamps=1&includeMarkers=1&includeOnDeck=1&includePopularLeaves=1&includePreferences=1&includeRelated=1&includeRelatedCount=1&includeReviews=1&includeStations=1';
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
        },
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
            2003: 'Photo'
        },
        this.selSecOption ={
            1: [
                {
                    "text": i18n.t('Modules.ET.optExpType.SecMovies'),
                    "value": this.ETmediaType.Movie
                }
            ],
            2: [
                {
                    "text": i18n.t('Modules.ET.optExpType.SecTVEpisodes'),
                    "value": this.ETmediaType.Episode
                },
                {
                    "text": i18n.t('Modules.ET.optExpType.SecTVSeries'),
                    "value": this.ETmediaType.Show
                }
            ],
            8: [
                {
                    "text": i18n.t('Modules.ET.optExpType.SecAudioAlbum'),
                    "value": this.ETmediaType.Album
                },
                {
                    "text": i18n.t('Modules.ET.optExpType.SecAudioArtist'),
                    "value": this.ETmediaType.Artist
                },
                {
                    "text": i18n.t('Modules.ET.optExpType.SecAudioTrack'),
                    "value": this.ETmediaType.Track
                }
            ],
            13: [
                {
                    "text": i18n.t('Modules.ET.optExpType.SecPhotos'),
                    "value": this.ETmediaType.Photo
                }
            ],
            15: [
                {
                    "text": i18n.t('Modules.ET.optExpType.SecPlaylistAudio'),
                    "value": this.ETmediaType.Playlist_Audio
                },
                {
                    "text": i18n.t('Modules.ET.optExpType.SecPlaylistVideo'),
                    "value": this.ETmediaType.Playlist_Video
                },
                {
                    "text": i18n.t('Modules.ET.optExpType.SecPlaylistPhoto'),
                    "value": this.ETmediaType.Playlist_Photo
                }
            ],
            1001: [
                {
                    "text": i18n.t('Modules.ET.optExpType.SecLibraries'),
                    "value": this.ETmediaType.Libraries
                }
            ]
        }
    }

    async getSectionData({sectionName, baseURL, accessToken, libType, libTypeSec})
    {
        const sectionData = []
        // Find LibType steps
        const step = wtconfig.get("PMS.ContainerSize." + libType)
        log.debug(`Got Step size as: ${step}`)
        let libSize, libKey, element
        //if (libType != 'libraryInfo')
        if (['libraryInfo', 'playlistInfo'].indexOf(libType) < 0)
        {
            log.info(`Starting getSectionData with Name: "${sectionName}" and with a type of: "${libType}" and a sec type of: "${libTypeSec}"`)
            // Get Section Key
            libKey = await et.getSectionKey({libName: sectionName, baseURL: baseURL, accessToken: accessToken})
            log.debug(`Got SectionKey as: ${libKey}`)
            // Get the size of the library
            libSize = await et.getSectionSizeByKey({sectionKey: libKey, baseURL: baseURL, accessToken: accessToken, libType: libType})
            log.debug(`Got Section size as: ${libSize}`);
        }
        else
        {
            element = '/library/sections/all';
        }
        // Now read the fields and level defs

        // Current item
        let idx = 0
        // Now let's walk the section
        let chuncks, postURI
        let size
        do {
            if (libType == 'photo')
            {
                element = '/library/sections/' + libKey + '/all';
                postURI = `?addedAt>>=-2208992400&X-Plex-Container-Start=${idx}&X-Plex-Container-Size=${step}&type=${libTypeSec}&${this.uriParams}`;
            }
            else if (libType == 'playlist')
            {
                element = '/playlists/' + libKey;
                postURI = `/items?X-Plex-Container-Start=${idx}&X-Plex-Container-Size=${step}`;
            }
            else if (libType == 'libraryInfo')
            {
                element = '/library/sections/all';
                postURI = `?X-Plex-Container-Start=${idx}&X-Plex-Container-Size=${step}`;
            }
            else if (libType == 'playlistInfo')
            {
                element = '/playlists/all';
                postURI = `?X-Plex-Container-Start=${idx}&X-Plex-Container-Size=${step}`;
            }
            else
            {
                element = '/library/sections/' + libKey + '/all';
                postURI = `?X-Plex-Container-Start=${idx}&X-Plex-Container-Size=${step}&type=${libTypeSec}&${this.uriParams}`;
            }
            log.info(`Calling url ${baseURL + element + postURI}`);
            chuncks = await et.getItemData({baseURL: baseURL, accessToken: accessToken, element: element, postURI: postURI});
            size = JSONPath({path: '$.MediaContainer.size', json: chuncks});
            const totalSize = JSONPath({path: '$.MediaContainer.totalSize', json: chuncks});
            log.info(`getSectionData chunck size is ${size} and idx is ${idx} and totalsize is ${totalSize}`)
            store.commit("UPDATE_EXPORTSTATUS", i18n.t('Modules.ET.Status.GetSectionItems', {idx: idx, chunck: size, totalSize: totalSize}))
            sectionData.push(chuncks)
            log.debug(`Pushed chunk as ${JSON.stringify(chuncks)}`)
            idx = idx + step;
        } while (size > 1);
        return sectionData;
    }

    async getSectionSizeByKey({sectionKey, baseURL, accessToken, libType})
    {
        let sizeURI, sizePostURI, sizeContents;
        if (libType == 'playlist')
        {
            sizeURI = '/playlists/' + sectionKey
            sizePostURI = '/items?X-Plex-Container-Start=0&X-Plex-Container-Size=0'
        }
        else
        {
            sizeURI = '/library/sections/' + sectionKey
            sizePostURI = '/all?X-Plex-Container-Start=0&X-Plex-Container-Size=0'
        }
        sizeContents = await et.getItemData({baseURL: baseURL, accessToken: accessToken, element: sizeURI, postURI: sizePostURI});
        const size = await JSONPath({path: '$..totalSize', json: sizeContents});
        return size
    }

    async getSectionSizeByName({sectionName, baseURL, accessToken})
    {
        const libKey = await et.getSectionKey({libName: sectionName, baseURL: baseURL, accessToken: accessToken})
        const sizeURI = '/library/sections/' + libKey
        const sizePostURI = '/all?X-Plex-Container-Start=0&X-Plex-Container-Size=0'
        const sizeContents = await et.getItemData({baseURL: baseURL, accessToken: accessToken, element: sizeURI, postURI: sizePostURI});
        const size = await JSONPath({path: '$..totalSize', json: sizeContents});
        return size
    }

    async getItemData({baseURL, accessToken, element, postURI=defpostURI})
    {
        const url = baseURL + element + postURI;
        this.PMSHeader["X-Plex-Token"] = accessToken;
        log.verbose(`Calling url in getItemData: ${url}`)
        let response = await fetch(url, { method: 'GET', headers: this.PMSHeader});
        let resp = await response.json();
        log.silly(`Response in getItemData: ${JSON.stringify(resp)}`)
        return resp
    }

    getRealLevelName(level, libType) {
        // First get the real name of the level, and not just the display name
        let levelName
        if (['libraryInfo', 'playlistInfo'].indexOf(libType) > -1)
        {
            levelName = 'all';
        }
        else
        {
            if (libType == 'playlist')
            {
                libType = libType + '-' + (et.RevETmediaType[store.getters.getSelectedLibTypeSec]).toString().toLowerCase();
            }
            levelName = defLevels[libType]['levels'][level]
            if (levelName == undefined)
            {
                // We are dealing with a custom level here
                levelName = level
            }
        }
        return levelName
    }

    async getSections(address, accessToken)
    {
        // Returns an array of json, as:
        // [{"title":"DVR Movies","key":31,"type":"movie"}]
        const result = [];
        let url = address + '/library/sections/all'
        this.PMSHeader["X-Plex-Token"] = accessToken;
        let response = await fetch(url, { method: 'GET', headers: this.PMSHeader});
        let resp = await response.json();
        let respJSON = await Promise.resolve(resp);
        let sections = await JSONPath({path: '$..Directory', json: respJSON})[0];
        let section;
        for (section of sections){
            const subItem = {}
            subItem['title'] = JSONPath({path: '$..title', json: section})[0];
            subItem['key'] = parseInt(JSONPath({path: '$..key', json: section})[0]);
            subItem['type'] = JSONPath({path: '$..type', json: section})[0];
            subItem['scanner'] = JSONPath({path: '$..scanner', json: section})[0];
            subItem['agent'] = JSONPath({path: '$..agent', json: section})[0];
            result.push(subItem)
        }
        await Promise.resolve(result);
        url = address + '/playlists';
        response = await fetch(url, { method: 'GET', headers: this.PMSHeader});
        resp = await response.json();
        respJSON = await Promise.resolve(resp);
        if (JSONPath({path: '$..size', json: respJSON})[0] > 0)
        {
            sections = await JSONPath({path: '$..Metadata', json: respJSON})[0];
            for (section of sections){
                const subItem = {}
                subItem['title'] = JSONPath({path: '$..title', json: section})[0];
                subItem['key'] = parseInt(JSONPath({path: '$..ratingKey', json: section})[0]);
                subItem['type'] = JSONPath({path: '$..type', json: section})[0];
                subItem['playlistType'] = JSONPath({path: '$..playlistType', json: section})[0];
                result.push(subItem)
            }
        }
        return  result
    }

    getLevelDisplayName(level, libType){
        // return displayname for the buildin levels
        if (libType == 'playlist')
        {
            libType = libType + '-' + (et.RevETmediaType[store.getters.getSelectedLibTypeSec]).toString().toLowerCase();
        }
        const levels = et.getLevels(libType)
        let result = '';
        loop1:
            for(var key in levels){
                if ( levels[key] == level)
                {
                    result = key;
                    break loop1;
                }
            }
        if ( result == '')
        {
            // We need to check custom levels
            const customLevels = et.getCustomLevels(libType)
            loop2:
                for(key in customLevels){
                    if ( customLevels[key] == level)
                    {
                        result = key;
                        break loop2;
                    }
                }
        }
        return result;
    }

    getLibDisplayName(libKey, sections){
        // return displayname for library
        let result = '';
        for (var i=0; i<sections.length; i++){
            if ( JSONPath({path: '$..key', json: sections[i]}) == libKey)
            {
                result = JSONPath({path: '$..title', json: sections[i]});
                i = sections.length;
            }
        }
        return result;
    }

    getLevelFields(level, libType, pListType) {
        // return fields in a level
        const out = []
        if (libType == 'playlist')
        {
            pListType = (et.RevETmediaType[store.getters.getSelectedLibTypeSec]).toString().toLowerCase();
            libType = libType + '-' + (et.RevETmediaType[store.getters.getSelectedLibTypeSec]).toString().toLowerCase();
        }
        let realName = et.getRealLevelName(level, libType);
        log.debug(`RealName is ${realName}`);
        // We need to load fields and defs into def var
        switch(libType) {
            case 'movie':
              // code block
              def = JSON.parse(JSON.stringify(require('./../defs/def-Movie.json')));
              break;
            case 'episode':
              // code block
              def = JSON.parse(JSON.stringify(require('./../defs/def-Episode.json')));
              break;
            case 'show':
                // code block
                def = JSON.parse(JSON.stringify(require('./../defs/def-Show.json')));
                break;
            case 'artist':
                // code block
                def = JSON.parse(JSON.stringify(require('./../defs/def-Artist.json')));
                break;
            case 'track':
                    // code block
                    def = JSON.parse(JSON.stringify(require('./../defs/def-Track.json')));
                    break;
            case 'album':
                // code block
                def = JSON.parse(JSON.stringify(require('./../defs/def-Album.json')));
                break;
            case 'photo':
                // code block
                def = JSON.parse(JSON.stringify(require('./../defs/def-Photo.json')));
                break;
            case 'playlist-audio':
                // code block
                def = JSON.parse(JSON.stringify(require('./../defs/def-Playlist-' + pListType + '.json')));
                break;
            case 'playlist-photo':
                // code block
                def = JSON.parse(JSON.stringify(require('./../defs/def-Playlist-' + pListType + '.json')));
                break;
            case 'playlist-video':
                // code block
                def = JSON.parse(JSON.stringify(require('./../defs/def-Playlist-' + pListType + '.json')));
                break;
            case 'libraryInfo':
                def = JSON.parse(JSON.stringify(require('./../defs/def-LibraryInfo.json')));
                break;
            case 'playlistInfo':
                def = JSON.parse(JSON.stringify(require('./../defs/def-PlaylistInfo.json')));
                break;
            default:
              // code block
              log.error(`Unknown libtype: "${libType}" or level: "${level}" in "getLevelFields"`);
          }
        let levels = def[libType]['level'][realName];
        if (levels == undefined)
        {
            // We are dealing with a custom level
            levels = wtconfig.get(`ET.CustomLevels.${libType}.level.${realName}`);
        }
        Object.keys(levels).forEach(function(key) {
            out.push(levels[key])
          });
        return out
    }

    async getLevelCall (libType, level) {
        // this will return number of calls needed
        if (libType == 'playlist')
        {
            libType = libType + '-' + this.RevETmediaType[store.getters.getSelectedLibTypeSec].toLowerCase();
        }

        const count = await defLevels[libType]['LevelCount'][level]
        log.debug('Count needed is: ' + count)
        return count
    }

    getLevels(libType) {
        // Returns an json of levels for a selected type og medias, like 'movie'
        const levels = defLevels[libType]['levels']
        log.debug(`ET LevelNames: ${JSON.stringify(levels)}`);
        return levels
    }

    getCustomLevels(libType) {
        const notDefined = {"No Level Yet": ""}
        // Returns an json of custom levels for a selected type og medias, like 'movie'
        const levels = wtconfig.get(`ET.CustomLevels.${libType}.levels`, notDefined)
        log.debug('ET Custom LevelNames: ' + JSON.stringify(levels))
        return levels
    }

    getLevelKeys(libType){
        // Only return the keys for possible levels
        const out = []
        const levels = defLevels[libType]['levels']
        Object.keys(levels).forEach(function(key) {
            out.push(key)
          });
        return out
    }

    getFieldKey(libType, fieldName) {
        return def[libType]['fields'][fieldName]['key']
    }

    resolveAfter2Seconds() {
        return new Promise(resolve => {
          setTimeout(() => {
            resolve('resolved');
          }, 2000);
        });
      }

    async getSectionKey({libName, baseURL, accessToken}){
        // Returns the key of a library
        const sections = await et.getSections(baseURL, accessToken)
        let result = '';
        for (var i=0; i<sections.length; i++){
            if (String(await JSONPath({path: '$..title', json: sections[i]})) == libName) {
                result = await JSONPath({path: '$..key', json: sections[i]});
                i = sections.length;
            }
        }
        return result
    }

    getField(libType, fieldName) {
        return defFields['fields'][fieldName];
    }

    getFieldType(libType, fieldName) {
        //return def[libType]['fields'][fieldName]['type']
        return defFields['fields'][fieldName]['type'];
    }

    getFieldCall(libType, fieldName) {
        return defFields['fields'][fieldName]['call'];
    }

    getFieldSubtype(libType, fieldName) {
        return defFields['fields'][fieldName]['subtype'];
    }


    getFieldsKeyVal( libType, level, pListType) {
        // Get fields for level
        let fields
        fields = et.getLevelFields(level, libType, pListType)
        const out = []
        fields.forEach(element => {
            const item = {}
            item[element] = et.getFieldKey(libType, element)
            out.push(item)
        });
        return out
    }

    getFieldsKeyValType( libType, level, pListType) {
        // Get field and type for level
        const fields = et.getLevelFields(level, libType, pListType)
        const out = []
        fields.forEach(element => {
            const item = {}
            const vals = []
            vals.push(et.getFieldKey(libType, element))
            vals.push(et.getFieldType(libType, element))
            item[element] = vals
            out.push(item)
        });
        return out
    }

    // Return all field keys defined for a lib type, in a sorted array of json, with an index
    getAllFields( {libType}) {
        // We need to load fields and defs into typeFields var
        let typeFields;
        switch(libType) {
            case 'movie':
              // code block
              typeFields = JSON.parse(JSON.stringify(require('./../defs/def-Movie.json')));
              break;
            case 'episode':
              // code block
              typeFields = JSON.parse(JSON.stringify(require('./../defs/def-Episode.json')));
              break;
            case 'show':
                // code block
                typeFields = JSON.parse(JSON.stringify(require('./../defs/def-Show.json')));
                break;
            case 'artist':
                // code block
                typeFields = JSON.parse(JSON.stringify(require('./../defs/def-Artist.json')));
                break;
            case 'album':
                    // code block
                    typeFields = JSON.parse(JSON.stringify(require('./../defs/def-Album.json')));
                    break;
            case 'track':
                    // code block
                    typeFields = JSON.parse(JSON.stringify(require('./../defs/def-Track.json')));
                    break;
            case 'photo':
                // code block
                typeFields = JSON.parse(JSON.stringify(require('./../defs/def-Photo.json')));
                break;
            case 'playlist-audio':
                // code block
                typeFields = JSON.parse(JSON.stringify(require('./../defs/def-Playlist-audio.json')));
                break;
            case 'playlist-photo':
                // code block
                typeFields = JSON.parse(JSON.stringify(require('./../defs/def-Playlist-photo.json')));
                break;
            case 'playlist-video':
                // code block
                typeFields = JSON.parse(JSON.stringify(require('./../defs/def-Playlist-video.json')));
                break;
            default:
              // code block
          }
        // Get all the fields keys
        var filteredFields = JSONPath({path: '$.' + libType + '.level.all.*', json: typeFields});
        // Sort them, and add an index as well, so drageble is happy
        return filteredFields.sort().map((name, index) => {
            return { name, order: index + 1 };
        });
    }

    getFields( libType, level, pListType) {
        // Get field and type for level
        const fields = et.getLevelFields(level, libType, pListType)
        const out = []
        fields.forEach(element => {
            const item = {}
            item[element] = et.getField(libType, element)
            out.push(item)
        });
        return out
    }

    async getSectionNameSize(baseURI, accessToken, sectionID) {
        //getSectionNameAndSize(baseURI, accessToken, sectionID)
        const url = baseURI + '/library/sections/' + sectionID + '/all?X-Plex-Container-Start=0&X-Plex-Container-Size=0'
        this.PMSHeader["X-Plex-Token"] = accessToken;
        const result = {}
        let response = await fetch(url, { method: 'GET', headers: this.PMSHeader});
        let resp = await response.json();
        const respJSON = await Promise.resolve(resp)
        result['size'] = JSONPath({path: '$.MediaContainer.totalSize', json: respJSON});
        result['name'] = JSONPath({path: '$.MediaContainer.librarySectionTitle', json: respJSON});
        return result
    }

    checkServerConnect(server) {
        server.connections.forEach((val) => {
            log.info(val.uri)
            let baseurl = val.uri
                axios.get(baseurl + '/identity')
                .then(response => {
                    log.info(response)
                    if(response.status == 200){
                        log.info("checkServerConnect: response status is 200")
                    }
                  }).catch((error) => {
                    if (error.response) {
                        // The request was made and tgite server responded with a status code
                        // that falls out of the range of 2xx
                        log.error(error.response.data)
                        log.error(error.response.status)
                        alert(error.response.data.error)
                        //this.danger(error.response.status, error.response.data.error);
                    } else if (error.request) {
                        // The request was made but no response was received
                        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
                        // http.ClientRequest in node.js
                        log.error(error.request);
                    } else {
                        // Something happened in setting up the request that triggered an Error
                        log.error('Error', error.message);
                    }
                }
            )
            }
          )
        let serverAdress = []
        return serverAdress
    }
}

const excel2 = new class Excel {
    constructor() {
        this.uriParams = 'checkFiles=1&includeAllConcerts=1&includeBandwidths=1&includeChapters=1&includeChildren=1&includeConcerts=1&includeExtras=1&includeFields=1&includeGeolocation=1&includeLoudnessRamps=1&includeMarkers=1&includeOnDeck=1&includePopularLeaves=1&includePreferences=1&includeRelated=1&includeRelatedCount=1&includeReviews=1&includeStations=1';
    }

    AddRow(Sheet, Row) {
        // Adds a row to the Sheet
        Sheet.addRow(Row);
    }

    async NewExcelWorkBook() {
        const Excel = require('exceljs');
        // A new Excel Work Book
        const workbook = new Excel.Workbook();
        // Some information about the Excel Work Book.
        workbook.creator = 'WebTools-NG';
        workbook.lastModifiedBy = '';
        workbook.created = new Date();
        workbook.modified = new Date();
        return workbook
    }

    async NewSheet(Workbook, Library, Level) {
        const sheet = Workbook.addWorksheet(Library + '-' + Level, {
            views: [
            {state: 'frozen', ySplit: 1}
            ]
            });
        return sheet
    }

    GetHeader(Level, libType, pListType) {
        const columns = []
        log.verbose(`GetHeader level: ${Level} - libType: ${libType}`)
        // Get level fields
        const fields = et.getLevelFields(Level, libType, pListType)
        for (var i=0; i<fields.length; i++) {
            log.verbose(`Column: ${fields[i]}`)
            columns.push(fields[i])
        }
        return columns
    }

    async AddHeader(Sheet, Level, libType, pListType) {
        const columns = []
        log.verbose(`AddHeader level: ${Level} - libType: ${libType}`)
        // Get level fields
        const fields = et.getLevelFields(Level, libType, pListType)
        for (var i=0; i<fields.length; i++) {
            log.verbose('Column: ' + fields[i] + ' - ' + fields[i])
            let column = { header: fields[i], key: fields[i], width: 5 }
            columns.push(column)
        }
        Sheet.columns = columns
        // Add background to header column
        Sheet.getRow(1).fill = {
            type: 'pattern',
            pattern:'solid',
            fgColor:{ argb:'729fcf' }
            }
        // Set header font to bold
        Sheet.getRow(1).font = {bold: true}

/*         Sheet.autoFilter = {
            from: 'A1',
            to: 'D1',
          } */
        return true;
    }

    async getFileName({ Library, Level, Type, Module, exType }){
        const dateFormat = require('dateformat');
        const OutDir = wtconfig.get('General.ExportPath');
        const timeStamp=dateFormat(new Date(), "yyyy.mm.dd_h.MM.ss");
        const path = require('path');
        let outFile = store.getters.getSelectedServer.name + '_';
        outFile += Library + '_';
        outFile += exType + '_';
        outFile += Level + '_';
        outFile += timeStamp + '.' + Type;
        const targetDir = path.join(
            OutDir, wtutils.AppName, Module);
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

    async SaveWorkbook({ Workbook, Library, Level, Type, exType } ) {
        const fs = require('fs');
        const name = await this.getFileName( { Library: Library, Level: Level, Type: Type, Module: i18n.t('Modules.ET.Name'), exType: exType });
        log.info('Saving output file as: ' + name);
        // Save Excel on Hard Disk
        Workbook.xlsx.writeBuffer()
            .then(buffer => fs.writeFileSync(name, buffer))
        return true;
    }

    async postProcess( {name, val, title=""} ){
        const valArray = val.split(wtconfig.get('ET.ArraySep', ' * '));
        let retArray = [];
        let x, retVal, start, strStart, end, result;
        try {
            switch ( String(name) ){
                case "Part File":
                    for (x=0; x<valArray.length; x++) {
                        retArray.push(path.basename(valArray[x]))
                    }
                    retVal = retArray.join(wtconfig.get('ET.ArraySep', ' * '))
                    break;
                case "Part File Path":
                    for (x=0; x<valArray.length; x++) {
                        retArray.push(path.dirname(valArray[x]));
                    }
                    retVal = retArray.join(wtconfig.get('ET.ArraySep', ' * '));
                    break;
                case "Part Size":
                    for (x=0; x<valArray.length; x++) {
                        let theSize = valArray[x].replaceAll('"', '').replaceAll(wtconfig.get('ET.TextQualifierCSV'),'');
                        if (theSize.startsWith('"')){
                            theSize = theSize.slice(1,-1);
                        }
                        try{
                            retArray.push(filesize(theSize));
                        }
                        catch (error)
                        {
                            log.error(`Error getting Part Size was ${error} for ${theSize}`);
                        }
                    }
                    retVal = retArray.join(wtconfig.get('ET.ArraySep', ' * '))
                    break;
                case "Original Title":
                    if (wtconfig.get('ET.OrgTitleNull'))
                    {
                        // Override with title if not found
                        if (val == wtconfig.get('ET.NotAvail'))
                        {
                            retVal = title;
                        }
                        else { retVal = val; }
                    }
                    else
                    {
                        retVal = val;
                    }
                    break;
                case "Sort title":
                    if (wtconfig.get('ET.SortTitleNull'))
                    {
                        // Override with title if not found
                        if (val == wtconfig.get('ET.TextQualifierCSV') + 'undefined' + wtconfig.get('ET.TextQualifierCSV'))
                        {
                            retVal = title;
                        }
                        else {
                            retVal = val;
                        }
                    }
                    else
                    {
                        if (val == wtconfig.get('ET.TextQualifierCSV') + 'undefined' + wtconfig.get('ET.TextQualifierCSV'))
                        {
                            retVal = wtconfig.get('ET.NotAvail');
                        }
                        else {
                            retVal = val;
                        }
                    }
                    break;
                case "IMDB ID":
                    if (val == wtconfig.get('ET.NotAvail'))
                    {
                        retVal = val;
                        break;
                    }
                    start = val.indexOf("imdb://");
                    console.log('Ged2 start', start)
                    if (start == -1)
                    {
                        retVal = wtconfig.get('ET.NotAvail');
                        break;
                    }
                    strStart = val.substring(start);
                    console.log('Ged3 strStart', strStart)
                    end = strStart.indexOf(wtconfig.get('ET.ArraySep'));
                    console.log('Ged4 end', end)
                    result = ''
                    if (end == -1)
                    { result = strStart.substring(7) }
                    else
                    { result = strStart.substring(7, end) }
                    retVal = result;
                    console.log('Ged5 retVal', retVal)
                    break;
                case "IMDB ID (Legacy)":
                    if (val == wtconfig.get('ET.NotAvail'))
                    {
                        retVal = val;
                        break;
                    }
                    // Cut off start of string
                    start = val.indexOf("tt");
                    if (start == -1)
                    {
                        retVal = wtconfig.get('ET.NotAvail');
                        break;
                    }
                    strStart = val.substring(start);
                    result = strStart.split('?')[0]
                    retVal = result;
                    break;
                case "IMDB Language (Legacy)":
                    if (val == wtconfig.get('ET.NotAvail'))
                    {
                        retVal = val;
                        break;
                    }
                    if (val.indexOf("imdb://") == -1)
                    {
                        retVal = wtconfig.get('ET.NotAvail');
                        break;
                    }
                    retVal = val.split('=')[1];
                    if (retVal == 'undefined')
                    {
                        retVal = wtconfig.get('ET.NotAvail');
                    }
                    break;
                case "IMDB Link":
                        if (val == wtconfig.get('ET.NotAvail'))
                        {
                            retVal = val;
                            break;
                        }
                        start = val.indexOf("imdb://");
                        if (start == -1)
                        {
                            retVal = wtconfig.get('ET.NotAvail');
                            break;
                        }
                        strStart = val.substring(start);
                        end = strStart.indexOf(wtconfig.get('ET.ArraySep'));
                        result = ''
                        if (end == -1)
                        { result = strStart.substring(7) }
                        else
                        { result = strStart.substring(7, end) }
                        result = 'https://www.imdb.com/title/' + result;
                        retVal = result;
                        break;
                case "IMDB Link (Legacy)":
                    if (val == wtconfig.get('ET.NotAvail'))
                        {
                            retVal = val;
                            break;
                        }
                    if (val.indexOf("imdb://") == -1)
                    {
                        retVal = wtconfig.get('ET.NotAvail');
                    }
                    else
                    {
                        retVal = 'https://imdb.com/' + val.split('//')[1];
                        retVal = retVal.split('?')[0];
                    }
                    break;
                case "TVDB ID":
                    if (val == wtconfig.get('ET.NotAvail'))
                    {
                        retVal = val;
                        break;
                    }
                    start = val.indexOf("tvdb://");
                    if (start == -1)
                    {
                        retVal = wtconfig.get('ET.NotAvail');
                        break;
                    }
                    strStart = val.substring(start);
                    end = strStart.indexOf(wtconfig.get('ET.ArraySep'));
                    result = ''
                    if (end == -1)
                    { result = strStart.substring(7) }
                    else
                    { result = strStart.substring(7, end) }
                    retVal = result;
                    break;
                case "TVDB ID (Legacy)":
                        if (val == wtconfig.get('ET.NotAvail'))
                        {
                            retVal = val;
                            break;
                        }
                        // Cut off start of string
                        start = val.indexOf("thetvdb://");
                        if (start == -1)
                        {
                            retVal = wtconfig.get('ET.NotAvail');
                            break;
                        }
                        strStart = val.substring(start);
                        result = strStart.split('?')[0]
                        retVal = result;
                        break;
                case "TVDB Language (Legacy)":
                        if (val == wtconfig.get('ET.NotAvail'))
                        {
                            retVal = val;
                            break;
                        }
                        if (val.indexOf("tvdb://") == -1)
                        {
                            retVal = wtconfig.get('ET.NotAvail');
                            break;
                        }
                        retVal = val.split('=')[1];
                        if (retVal == 'undefined')
                        {
                            retVal = wtconfig.get('ET.NotAvail');
                        }
                        break;
                case "TMDB ID":
                    if (val == wtconfig.get('ET.NotAvail'))
                    {
                        retVal = val;
                        break;
                    }
                    start = val.indexOf("tmdb://");
                    if (start == -1)
                    {
                        retVal = wtconfig.get('ET.NotAvail');
                        break;
                    }
                    strStart = val.substring(start);
                    end = strStart.indexOf(wtconfig.get('ET.ArraySep'));
                    result = ''
                    if (end == -1)
                    { result = strStart.substring(7) }
                    else
                    { result = strStart.substring(7, end) }
                    retVal = result;
                    break;
                case "TMDB Link":
                    if (val == wtconfig.get('ET.NotAvail'))
                    {
                        retVal = val;
                        break;
                    }
                    start = val.indexOf("tmdb://");
                    strStart = val.substring(start);
                    end = strStart.indexOf(wtconfig.get('ET.ArraySep'));
                    result = ''
                    if (end == -1)
                    { result = strStart.substring(7) }
                    else
                    { result = strStart.substring(7, end) }
                    result = 'https://www.themoviedb.org/movie/' + result;
                    retVal = result;
                    break;
                default:
                    log.error(`postProcess no hit for: ${name}`)
                    break;
            }
        } catch (error) {
            retVal = 'ERROR'
        }
        return await retVal;
    }

    isEmpty( { val })
    {
        if ([null, 'undefined', ''].indexOf(val) > -1)
        {
            return wtconfig.get('ET.NotAvail', 'N/A');
        }
        else
        {
            return val;
        }
    }

    async forceDownload(url, target) {
        const fs = require('fs');
        //var out = fs.createWriteStream(target);
        var request = require('request');
        await new Promise(resolve =>
            request(url)
              .pipe(fs.createWriteStream(target))
              .on('finish', resolve));
      }

    async exportPics( { type: extype, data, baseURL, accessToken} ) {
        let ExpDir, picUrl, resolutions;
        if (extype == 'posters')
        {
            picUrl = String(JSONPath({path: '$.thumb', json: data})[0]);
            resolutions = wtconfig.get('ET.Posters_Dimensions', '75*75').split(',');
            ExpDir = path.join(
                wtconfig.get('General.ExportPath'),
                wtutils.AppName,
                'ExportTools', 'Posters');
        }
        else
        {
            picUrl = String(JSONPath({path: '$.art', json: data})[0]);
            resolutions = wtconfig.get('ET.Art_Dimensions', '75*75').split(',');
            ExpDir = path.join(
                wtconfig.get('General.ExportPath'),
                wtutils.AppName,
                'ExportTools', 'Art');
        }
        // Create export dir
        var fs = require('fs');
         if (!fs.existsSync(ExpDir)){
            fs.mkdirSync(ExpDir);
        }
        let key = String(JSONPath({path: '$.ratingKey', json: data})[0]);
        let title = String(JSONPath({path: '$.title', json: data})[0]);
        // Get resolutions to export as
        for(let res of resolutions) {
            const fileName = key + '_' + title + '_' + res.trim() + '.jpg'
            let outFile = path.join(
                ExpDir,
                fileName
                );
            // Build up pic url
            const width = res.split('*')[0].trim();
            const hight = res.split('*')[1].trim();
            let URL = baseURL + '/photo/:/transcode?width=';
            URL += width + '&height=' + hight;
            URL += '&minSize=1&url=';
            URL += picUrl + '&X-Plex-Token=' + accessToken;
            await this.forceDownload(URL, outFile);
        }
    }

    async addRowToTmp( { libType, level, data, stream, pListType }) {
        log.debug(`Start addRowToTmp. libType: ${libType} - level: ${level}`)
        log.silly(`Data is: ${JSON.stringify(data)}`)
        let date, year, month, day, hours, minutes, seconds
        const fields = et.getFields( libType, level, pListType)
        let lookup, val, array, i, valArray, valArrayVal, subType, subKey
        let str = ''
        let result = ''
        let textSep = wtconfig.get('ET.TextQualifierCSV', '"');
        if ( textSep === ' ')
        {
            textSep = '';
        }
        for (var x=0; x<fields.length; x++) {
            var name = Object.keys(fields[x]);
            lookup = JSONPath({path: '$..key', json: fields[x]})[0];
            switch(String(JSONPath({path: '$..type', json: fields[x]}))) {
                case "string":
                    val = String(JSONPath({path: String(lookup), json: data})[0]);
                    // Make N/A if not found
                    val = this.isEmpty( { val: val });
                    // Remove CR, LineFeed ' and " from the
                    // string if present, and replace with a space
                    val = val.replace(/'|"|\r|\n/g, ' ');
                    val = textSep + val + textSep;
                    break;
                case "array":
                    array = JSONPath({path: lookup, json: data});
                    if (array === undefined || array.length == 0) {
                        val = wtconfig.get('ET.NotAvail', 'N/A');
                    }
                    else
                    {
                        valArray = []
                        for (i=0; i<array.length; i++) {
                            subType = JSONPath({path: '$..subtype', json: fields[x]});
                            subKey = JSONPath({path: '$..subkey', json: fields[x]});
                            switch(String(subType)) {
                                case "string":
                                    valArrayVal = String(JSONPath({path: String(subKey), json: array[i]})[0]);
                                    // Make N/A if not found
                                    valArrayVal = this.isEmpty( { val: valArrayVal });
                                    // Remove CR, LineFeed ' and " from the string if present
                                    valArrayVal = valArrayVal.replace(/'|"|\r|\n/g, ' ');
                                    break;
                                case "time":
                                    valArrayVal = JSONPath({path: String(subKey), json: array[i]});
                                    // Make N/A if not found
                                    if (valArrayVal == null || valArrayVal == "")
                                    {
                                        valArrayVal = wtconfig.get('ET.NotAvail', 'N/A')
                                    }
                                    else
                                    {
                                        const total = valArrayVal.length
                                        for (let i=0; i<total; i++) {
                                            seconds = '0' + (Math.round(valArrayVal[i]/1000)%60).toString();
                                            minutes = '0' + (Math.round((valArrayVal[i]/(1000 * 60))) % 60).toString();
                                            hours = (Math.trunc(valArrayVal[i] / (1000 * 60 * 60)) % 24).toString();
                                            // Will display time in 10:30:23 format
                                            valArrayVal = hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
                                        }
                                    }
                                    break;
                                default:
                                    log.error('NO ARRAY HIT (addRowToSheet-array)')
                            }
                            valArray.push(valArrayVal)
                        }
                        val = valArray.join(wtconfig.get('ET.ArraySep', ' * '))
                        if ( String(subType) == 'string')
                        {
                            val = textSep + val + textSep;
                        }
                    }
                    break;
                case "array-count":
                    val = JSONPath({path: String(lookup), json: data}).length;
                    break;
                case "int":
                    val = JSONPath({path: String(lookup), json: data})[0];
                    break;
                case "time":
                    val = JSONPath({path: String(lookup), json: data});
                    if ( typeof val !== 'undefined' && val  && val != '')
                    {
                        seconds = '0' + (Math.round(val/1000)%60).toString();
                        minutes = '0' + (Math.round((val/(1000 * 60))) % 60).toString();
                        hours = (Math.trunc(val / (1000 * 60 * 60)) % 24).toString();
                        // Will display time in 10:30:23 format
                        val = hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
                    }
                    else
                    {
                        val = wtconfig.get('ET.NotAvail', 'N/A')
                    }
                    break;
                case "datetime":
                    val = JSONPath({path: String(lookup), json: data});
                    if ( typeof val !== 'undefined' && val && val != '')
                    {
                        // Create a new JavaScript Date object based on the timestamp
                        // multiplied by 1000 so that the argument is in milliseconds, not seconds.
                        date = new Date(val * 1000);
                        year = date.getFullYear().toString();
                        month = ('0' + date.getMonth().toString()).substr(-2);
                        day = ('0' +  date.getDate().toString()).substr(-2);
                        hours = date.getHours();
                        minutes = "0" + date.getMinutes();
                        seconds = "0" + date.getSeconds();
                        // Will display time in 10:30:23 format
                        val = year+'-'+month+'-'+day+' '+hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
                    }
                    else
                    {
                        val = wtconfig.get('ET.NotAvail', 'N/A')
                    }
                    break;
            }
            let doPostProc = JSONPath({path: '$..postProcess', json: fields[x]})
            if ( doPostProc == 'true')
            {
                if (!["Original Title","Sort title"].includes(name)){
                    const title = JSONPath({path: String('$.title'), json: data})[0];
                    val = await this.postProcess( {name: name, val: val, title: title} );
                }
                else {
                    val = await this.postProcess( {name: name, val: val} );
                }
            }
            str += wtconfig.get('ET.ColumnSep') + val;
        }
        // Remove first character
        result = str.substr(1);
        await stream.write( result + "\n");
    }

    async sleep(ms) {
        return new Promise((resolve) => {
          setTimeout(resolve, ms);
        });
      }


    async createXLSXFile( {csvFile, level, libType, libName, exType, pListType} )
    {
        // This will loop thru a csv file, and create xlsx file
        // First create a WorkBook
        const workBook = await excel2.NewExcelWorkBook();
        // Create Sheet
        let sheet = await excel2.NewSheet(workBook, libName, level);
        // Add the header to the sheet
        await excel2.AddHeader(sheet, level, libType, pListType);

/*
        autoFilter sadly doesn't work :(
         sheet.autoFilter = {
            from: 'A1',
            to: 'E1',
            exclude: [1, 2] // excludes columns B and C from showing the AutoFilter button
        } */
        // Read the csv file line by line
        var lineReader = require('readline').createInterface({
            input: require('fs').createReadStream(csvFile)
          });

        var lineno = 0;

        const TextQualifierCSV = wtconfig.get('ET.TextQualifierCSV', '"');
        const bReplace = (TextQualifierCSV != '');
        var newLine;
        lineReader.on('line', async function (line) {
        // Skip first line
        if (lineno != 0){
            if (bReplace){
                newLine = line.replaceAll(TextQualifierCSV,'');
            }
            else {
                newLine = line
            }
            var lineArr = newLine.split( wtconfig.get('ET.ColumnSep', ','));
            await sheet.addRow(lineArr);
        }
        lineno++;
        });
        lineReader.on('close', async function () {
            if (wtconfig.get('ET.AutoXLSCol', false))
            {
                log.info('Setting xlsx column width')
                sheet.columns.forEach(function(column){
                    var dataMax = 0;
                    column.eachCell({ includeEmpty: true }, function(cell){
                        try {
                            var columnLength = cell.value.length;
                            if (columnLength > dataMax) {
                                dataMax = columnLength;
                            }
                        }
                        catch (error) {
                            // Failed, since either number or null, so simply ignoring
                        }
                    })
                    column.width = dataMax < 10 ? 10 : dataMax;
                });
                log.info('Setting xlsx column width ended')
            }
            await excel2.SaveWorkbook( { Workbook: workBook, Library: libName, Level: level, Type: "xlsx", exType: exType});
        });
    }

    async createOutFile( {libName, level, libType, baseURL, accessToken, exType, pListType, libTypeSec} )
    {
        const header = excel2.GetHeader(level, libType, pListType);
        log.debug(`header: ${header}`);
        const strHeader = header.join(wtconfig.get('ET.ColumnSep', ','));
        // Now we need to find out how many calls to make
        const call = await et.getLevelCall(libType, level);
        // Open a file stream
        const tmpFile = await excel2.getFileName({ Library: libName, Level: level, Type: 'tmp', Module: i18n.t('Modules.ET.Name'), exType: exType });
        var fs = require('fs');
        var stream = fs.createWriteStream(tmpFile, {flags:'a'});
        // Add the header
        stream.write( strHeader + "\n");
        var sectionData, x;
        {
            // Get all the items in small chuncks
            sectionData = await et.getSectionData({sectionName: libName, baseURL: baseURL, accessToken: accessToken, libType: libType, libTypeSec: libTypeSec})
            log.verbose(`Amount of chunks in sectionData are: ${sectionData.length}`)
            let item
            let counter = 1
            const totalSize = JSONPath({path: '$..totalSize', json: sectionData[0]});
            let jPath, sectionChunk;
            if (libType == 'libraryInfo')
            {
                jPath = "$.MediaContainer.Directory[*]";
            }
            else if (libType == 'playlistInfo')
            {
                jPath = "$.MediaContainer.Metadata[*]";
            }
            else
            {
                jPath = "$.MediaContainer.Metadata[*]";
            }

            for (x=0; x<sectionData.length; x++)
            {
                store.commit("UPDATE_EXPORTSTATUS", i18n.t('Modules.ET.Status.Processing-Chunk', {current: x, total: sectionData.length}));
                sectionChunk = await JSONPath({path: jPath, json: sectionData[x]});
                if ( call == 1 )
                {
                    for (item of sectionChunk){
                        store.commit("UPDATE_EXPORTSTATUS", i18n.t('Modules.ET.Status.ProcessItem', {count: counter, total: totalSize}));
                        await excel2.addRowToTmp( { libType: libType, level: level, data: item, stream: stream, pListType: pListType } );
                        if (wtconfig.get(`ET.CustomLevels.${libType}.Posters.${level}`, false))
                        {
                            await this.exportPics( { type: 'posters', data: item, baseURL: baseURL, accessToken: accessToken } )
                        }
                        if (wtconfig.get(`ET.CustomLevels.${libType}.Art.${level}`, false))
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
                    log.verbose(`Items to lookup are: ${urlStr}`)
                    store.commit("UPDATE_EXPORTSTATUS", i18n.t('Modules.ET.Status.Processing-Chunk-Detailed', {current: x, total: sectionData.length, urlStr: urlStr}));
                    const urlWIthPath = '/library/metadata/' + urlStr + '?' + this.uriParams;
                    log.verbose(`Items retrieved`);
                    const contents = await et.getItemData({baseURL: baseURL, accessToken: accessToken, element: urlWIthPath});
                    const contentsItems = await JSONPath({path: '$.MediaContainer.Metadata[*]', json: contents});
                    for (item of contentsItems){
                        store.commit("UPDATE_EXPORTSTATUS", i18n.t('Modules.ET.Status.ProcessItem', {count: counter, total: totalSize}));
                        if (wtconfig.get(`ET.CustomLevels.${libType}.Posters.${level}`, false))
                        {
                            await this.exportPics( { type: 'posters', data: item, baseURL: baseURL, accessToken: accessToken } )
                        }
                        if (wtconfig.get(`ET.CustomLevels.${libType}.Art.${level}`, false))
                        {
                            await this.exportPics( { type: 'arts', data: item, baseURL: baseURL, accessToken: accessToken } )
                        }
                        await excel2.addRowToTmp( { libType: libType, level: level, data: item, stream: stream, pListType: pListType } );
                        counter += 1;
                        await new Promise(resolve => setTimeout(resolve, 1));
                    }
                }
            }
        }
        stream.end();
        // Rename to real file name
        var newFile = tmpFile.replace('.tmp', '.csv')
        fs.renameSync(tmpFile, newFile);
        // Need to export to xlsx as well?
        if (wtconfig.get('ET.ExpExcel')){
            log.info('We need to create an xlsx file as well');
            store.commit("UPDATE_EXPORTSTATUS", i18n.t('Modules.ET.Status.CreateExlsFile'));
            await excel2.createXLSXFile( {csvFile: newFile, level: level, libType: libType, libName: libName, exType: exType, pListType: pListType});
        }
        store.commit("UPDATE_EXPORTSTATUS", `Export finished. File:"${newFile}" created`);
    }
}

export {et, excel2};