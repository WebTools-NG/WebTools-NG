// This file contails stuff used by the ET module
// Function ending with a W, returns a promise

import {wtconfig, wtutils} from '../../General/wtutils';
import i18n from '../../../../i18n';
import store from '../../../../store';

const {JSONPath} = require('jsonpath-plus');
const log = require('electron-log');
console.log = log.log;

wtconfig

const etHelper = new class ET {
    constructor() {
        this.defpostURI = '?checkFiles=1&includeRelated=0&includeExtras=1&includeBandwidths=1&includeChapters=1';
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
            libName: '',
            chunksSize: 0,
            levelCall: null
        },
        this.statusmsg = {
        },
        this.StartTime = null,
        this.EndTime = null,
        this.OutFile = null,
        this.rawMsgType = {
            'Status': 1,
            'Info': 2,
            'Chuncks': 3,
            'Items': 4,
            'OutFile': 5,
            'StartTime': 6,
            'EndTime': 7,
            'TimeElapsed': 8,
            'RunningTime': 9
        },
        this.revRawMsgType = {
            1: 'Status',
            2: 'Info',
            3: 'Chuncks',
            4: 'Items',
            5: 'OutFile',
            6: 'StartTime',
            7: 'EndTime',
            8: 'TimeElapsed',
            9: 'RunningTime'
        },
        this.msgType = {
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
    }

    clearStatus()
    {
        this.statusmsg = {};
        store.commit("UPDATE_SELECTEDETStatus", '');
    }

    updateStatusMsg(msgType, msg)
    {
        // Update relevant key
        this.statusmsg[msgType] = msg;
        // Tmp store of new msg
        let newMsg = '';
        // Walk each current msg keys
        Object.entries(this.statusmsg).forEach(([key, value]) => {
            if ( value != '')
            {
                newMsg += this.msgType[key] + ': ' + value + '\n';
            }
        })
        store.commit("UPDATE_SELECTEDETStatus", newMsg);
    }

    // Populate expSettings
    initExpSettings({
            baseURL = this.expSettings.baseURL,
            accessToken = this.expSettings.accessToken,
            libType = this.expSettings.libType,
            libTypeSec = this.expSettings.libTypeSec,
            exportLevel = this.expSettings.exportLevel,
            selLibKey = this.expSettings.selLibKey,
            levelName = this.expSettings.levelName,
            libName = this.expSettings.libName,
            chunksSize = this.expSettings.chunksSize,
            levelCall = this.expSettings.levelCall
        }){
        this.expSettings.baseURL = baseURL;
        this.expSettings.accessToken = accessToken;
        this.expSettings.libType = libType;
        this.expSettings.libTypeSec = libTypeSec;
        this.expSettings.exportLevel = exportLevel;
        this.expSettings.selLibKey = selLibKey;
        this.expSettings.levelName = levelName;
        this.expSettings.libName = libName;
        this.expSettings.chunksSize = chunksSize;
        this.expSettings.levelCall = levelCall;
        let settings = this.expSettings;
        settings.accessToken = 'REDACTED';
        log.info(`ExpSettings set to: ${JSON.stringify(settings)}`);
    }

    getNowTime(StartEnd){
        let now = new Date();
        if (StartEnd == 'start')
        {
            this.StartTime = now;
        }
        else
        {
            this.EndTime = now;
        }
        let hours = now.getHours();
        let minutes = now.getMinutes();
        let seconds = now.getSeconds();
        return hours + ':' + minutes + ':' + seconds;
    }

    getNowTimeW(StartEnd){
        return new Promise(function(resolve) {
            let now = new Date();
            if (StartEnd == 'start')
            {
                this.StartTime = now;
            }
            else
            {
                this.EndTime = now;
            }
            let hours = now.getHours();
            let minutes = now.getMinutes();
            let seconds = now.getSeconds();
            resolve(hours + ':' + minutes + ':' + seconds);
        });
    }

    getLibDisplayName(libKey, sections){
        try{
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
        catch(e){
            log.error(`Exception in etHelper.getLibDisplayName was: ${e}`);
            return null;
        }
    }

    getLibDisplayNameW(libKey, sections){
        return new Promise(function(resolve, reject) {
            try
            {
                // return displayname for library
                let result = '';
                for (var i=0; i<sections.length; i++){
                    if ( JSONPath({path: '$..key', json: sections[i]}) == libKey)
                    {
                        result = JSONPath({path: '$..title', json: sections[i]});
                        //i = sections.length;
                        break;
                    }
                }
                resolve(result);
            }
            catch(e){
                log.error(`Exception in etHelper.getLibDisplayNameW was ${e}`);
                reject(null);
            }
        });
    }

    // Returns true if libtype is a playlist
    isPlaylist() {
        return [this.ETmediaType.Playlist_Audio, this.ETmediaType.Playlist_Photo, this.ETmediaType.Playlist_Video].includes(this.expSettings.libTypeSec) == true;
    }


}

export { etHelper};