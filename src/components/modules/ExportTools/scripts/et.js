var def;
var defLevels = JSON.parse(JSON.stringify(require('./../defs/def-Levels.json')));
var defFields = JSON.parse(JSON.stringify(require('./../defs/def-Fields.json')));

const log = require('electron-log');
console.log = log.log;


import {wtconfig, wtutils} from '../../General/wtutils';

import i18n from '../../../../i18n'

const fetch = require('node-fetch');

const {JSONPath} = require('jsonpath-plus');
import axios from 'axios'


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
            Playlists: 3001
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
            2003: 'Photo',
            3001: 'Playlists'
        },
        this.selSecOption2 = {
            1: ['Modules.ET.optExpType.SecMovies'],
            2: ['Modules.ET.optExpType.SecTVEpisodes']
        }
        this.selSecOption = {
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
                },
                {
                    "text": i18n.t('Modules.ET.optExpType.SecPlaylists'),
                    "value": this.ETmediaType.Playlists
                }
            ],
            1001: [
                {
                    "text": i18n.t('Modules.ET.optExpType.SecLibraries'),
                    "value": this.ETmediaType.Libraries
                }
            ]
        },
        this.expSettings = {
            baseURL: '',
            accessToken: '',
            libType: '',
            libTypeSec: '',
            exportLevel: '',
            selLibKey: '',
            levelName: '',
            libName: ''
        },
        this.statusmsg = {
        },
        this.StartTime = null,
        this.EndTime = null,
        this.OutFile = null
    }

    getRealLevelName(level, libType) {
        // First get the real name of the level, and not just the display name
        let levelName
        if ([ et.ETmediaType.Libraries, et.ETmediaType.Playlists].indexOf(libType) > -1)
        {
            levelName = 'all';
        }
        else
        {
            if (libType == et.ETmediaType.Playlist)
            {
                libType = et.expSettings.libTypeSec;
            }
            levelName = defLevels[libType]['levels'][level];
            if (levelName == undefined)
            {
                // We are dealing with a custom level here
                levelName = et.expSettings.exportLevel;
            }
        }
        et.expSettings.levelName = levelName;
        return levelName;
    }

    getLevelDisplayName(level, libType){
        // return displayname for the buildin levels
        if (libType == et.ETmediaType.Playlist)
        {
            //libType = store.getters.getSelectedLibTypeSec;
            libType = et.expSettings.libTypeSec;
        }
        if (libType == et.ETmediaType.Libraries)
        {
            level = 'all'
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
            //const customLevels = et.getCustomLevels(et.RevETmediaType[libType])
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

    getLevelFields(level, libType) {
        // return fields in a level
        const out = [];
        if (libType == et.ETmediaType.Playlist)
        {
            libType = et.expSettings.libTypeSec;
        }

        let realName = et.getRealLevelName(level, libType);
        log.debug(`RealName is ${realName}`);
        // We need to load fields and defs into def var
        switch(libType) {
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
              log.error(`Unknown libtype: "${libType}" or level: "${level}" in "getLevelFields"`);
          }
        let levels = def[libType.toString()]['level'][realName];
        if (levels == undefined)
        {
            // We are dealing with a custom level
            levels = wtconfig.get(`ET.CustomLevels.${this.expSettings.libTypeSec}.level.${realName}`);
        }
        Object.keys(levels).forEach(function(key) {
            out.push(levels[key])
          });
        return out;
    }

    getLevels(libType) {
        // Returns an json of levels for a selected type og medias, like 'movie'
        const levels = defLevels[libType]['levels'];
        log.debug(`ET LevelNames: ${JSON.stringify(levels)}`);
        return levels
    }

    getCustomLevels(libType) {
        const notDefined = {"No Level Yet": ""}
        // Returns an json of custom levels for a selected type og medias, like 'movie'
        const levels = wtconfig.get(`ET.CustomLevels.${libType}.levels`, notDefined);
        log.debug('ET Custom LevelNames: ' + JSON.stringify(levels));
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

    getFieldsKeyVal( libType, level) {
        // Get fields for level
        let fields
        fields = et.getLevelFields(level, libType)
        const out = []
        fields.forEach(element => {
            const item = {}
            item[element] = et.getFieldKey(libType, element)
            out.push(item)
        });
        return out
    }

    getFieldsKeyValType( libType, level) {
        // Get field and type for level
        const fields = et.getLevelFields(level, libType)
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

    // Returns the name of the libtype
    getLibTypeName( libType) {
        if (this.isPlaylist(libType))
        {
            return 'playlist-' + (et.RevETmediaType[libType]).toLowerCase();
        }
        else
        {
            return (et.RevETmediaType[libType]).toLowerCase();
        }
    }

    // Returns true if libtype is a playlist
    isPlaylist( libType ) {
        return [et.ETmediaType.Playlist_Audio, et.ETmediaType.Playlist_Photo, et.ETmediaType.Playlist_Video].includes(libType) == true;
    }

    // Return all field keys defined for a lib type, in a sorted array of json, with an index
    getAllFields( {libType}) {
        // We need to load fields and defs into typeFields var
        let typeFields;
        switch( libType ) {
            case et.ETmediaType.Movie:
              // code block
              typeFields = JSON.parse(JSON.stringify(require('./../defs/def-Movie.json')));
              break;
            case et.ETmediaType.Episode:
              // code block
              typeFields = JSON.parse(JSON.stringify(require('./../defs/def-Episode.json')));
              break;
            case et.ETmediaType.Show:
                // code block
                typeFields = JSON.parse(JSON.stringify(require('./../defs/def-Show.json')));
                break;
            case et.ETmediaType.Artist:
                // code block
                typeFields = JSON.parse(JSON.stringify(require('./../defs/def-Artist.json')));
                break;
            case et.ETmediaType.Album:
                // code block
                typeFields = JSON.parse(JSON.stringify(require('./../defs/def-Album.json')));
                break;
            case et.ETmediaType.Track:
                // code block
                typeFields = JSON.parse(JSON.stringify(require('./../defs/def-Track.json')));
                break;
            case et.ETmediaType.Photo:
                // code block
                typeFields = JSON.parse(JSON.stringify(require('./../defs/def-Photo.json')));
                break;
            case et.ETmediaType.Playlist_Audio:
                // code block
                typeFields = JSON.parse(JSON.stringify(require('./../defs/def-Playlist-audio.json')));
                break;
            case et.ETmediaType.Playlist_Photo:
                // code block
                typeFields = JSON.parse(JSON.stringify(require('./../defs/def-Playlist-photo.json')));
                break;
            case et.ETmediaType.Playlist_Video:
                // code block
                typeFields = JSON.parse(JSON.stringify(require('./../defs/def-Playlist-video.json')));
                break;
            default:
              // code block
          }
        // Get all the fields keys
        const filteredFields = JSONPath({path: '$.' + libType.toString() + '.level.all.*', json: typeFields});
        // Sort them, and add an index as well, so drageble is happy
        return filteredFields.sort().map((name, index) => {
            return { name, order: index + 1 };
        });
    }

    getFields( libType, level) {
        // Get field and type for level
        const fields = et.getLevelFields(level, libType)
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

    async AddHeader(Sheet, Level, libType) {
        const columns = []
        log.verbose(`AddHeader level: ${Level} - libType: ${libType}`)
        // Get level fields
        const fields = et.getLevelFields(Level, libType)
        for (var i=0; i<fields.length; i++) {
            log.verbose('Column12: ' + fields[i] + ' - ' + fields[i])
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

    async SaveWorkbook({ Workbook, Library, Level, Type, exType } ) {
        const fs = require('fs');
        const name = await this.getFileName( { Library: Library, Level: Level, Type: Type, Module: i18n.t('Modules.ET.Name'), exType: exType });
        log.info('Saving output file as: ' + name);
        // Save Excel on Hard Disk
        Workbook.xlsx.writeBuffer()
            .then(buffer => fs.writeFileSync(name, buffer))
        return true;
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



}

export { et, excel2 };