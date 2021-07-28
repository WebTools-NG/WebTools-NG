// This file holds generic et functions


import { wtconfig, wtutils } from '../../General/wtutils';
import store from '../../../../store';
import {csv} from './csv';
import {et} from './et';
import i18n from '../../../../i18n';
import filesize from 'filesize';

var path = require("path");

const log = require('electron-log');
console.log = log.log;

var def;
var defLevels = JSON.parse(JSON.stringify(require('./../defs/def-Levels.json')));
var defFields = JSON.parse(JSON.stringify(require('./../defs/def-Fields.json')));
const {JSONPath} = require('jsonpath-plus');

//#region *** Internal functions ****

// Returns boolean if object is empty or not
function isEmptyObj(obj) {
    return !Object.keys(obj).length > 0;
  }

// Adds the String Qualifier if needed
function setStrSeperator( {str: str})
    {
        if ( wtconfig.get('ET.TextQualifierCSV') )
        {
            if ( wtconfig.get('ET.TextQualifierCSV') != ' ')
            {
                return wtconfig.get('ET.TextQualifierCSV') + str + wtconfig.get('ET.TextQualifierCSV');
            } else { return str; }
        }
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
    #_defpostURI = '?checkFiles=1&includeRelated=0&includeExtras=1&includeBandwidths=1&includeChapters=1';

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
            levelName: null,
            csvFile: null,
            csvStream: null,
            xlsxFile: null,
            xlsxStream: null,
            call: null,
            fields: null,
            currentItem: 0,
            totalItems: null
        };
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
        this.intSep = '{*WTNG-ET*}';
    }

    isEmpty( {val} )
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

    async postProcess( {name, val, title=""} ){
        const valArray = val.split(wtconfig.get('ET.ArraySep', ' * '));
        let retArray = [];
        let x, retVal, start, strStart, end, result;
        try {
            switch ( String(name) ){
                case "Audience Rating":
                    console.log('Ged 77 Audience Rating: ' + val)
                    retVal = val.substring(0, 3);
                    console.log('Ged 77-1 Audience Rating: ' + retVal)
                    break;
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
                        let compNA = (wtconfig.get('ET.TextQualifierCSV') + wtconfig.get('ET.NotAvail') + wtconfig.get('ET.TextQualifierCSV')).trim();
                        // Override with title if not found
                        if (val == compNA)
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
                        let compNA = (wtconfig.get('ET.TextQualifierCSV') + wtconfig.get('ET.NotAvail') + wtconfig.get('ET.TextQualifierCSV')).trim();
                        if (val == compNA)
                        {
                            retVal = title;
                        }
                        else {
                            retVal = val;
                        }
                    }
                    else
                    {
                        let compNA = (wtconfig.get('ET.TextQualifierCSV') + 'undefined' + wtconfig.get('ET.TextQualifierCSV')).trim();
                        if (val == compNA)
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

    async addRowToTmp( { data, fields }) {
        this.Settings.currentItem +=1;
        this.updateStatusMsg(this.#_RawMsgType.Items, i18n.t('Modules.ET.Status.Processing-Item', {current: this.Settings.currentItem, total: this.Settings.totalItems}));
        console.log('GED 99 FIX ABOVE')
        log.debug(`Start addRowToTmp`)
        log.silly(`Data is: ${JSON.stringify(data)}`)
        let name, key, type, subType, subKey;
        let date, year, month, day, hours, minutes, seconds;
        //let lookup, val, array, i, valArray, valArrayVal, subType, subKey
        let lookup, val, array, i, valArray, valArrayVal
        let str = ''
        //let result = ''
        let textSep = wtconfig.get('ET.TextQualifierCSV', '"');
        if ( textSep === ' ')
        {
            textSep = '';
        }
        try
        {
            for (var x=0; x<fields.length; x++) {
                this.updateStatusMsg(this.rawMsgType.Items, i18n.t('Modules.ET.Status.ProcessItem', {count: this.Settings.currentItem, total: this.Settings.totalItems}));
                var fieldDef = JSONPath({path: '$.fields.' + fields[x], json: defFields})[0];
                name = fields[x];
                key = fieldDef["key"];
                type = fieldDef["type"];
                subType = fieldDef["subtype"];
                subKey = fieldDef["subkey"];
                console.log(`Ged 34-2 subKey: ${subKey}, name: ${name}, key: ${key}, type: ${type}, subType: ${subType}`)
                //switch(String(JSONPath({path: '$..type', json: fields[x]}))) {
                switch(type) {
                    case "string":
                        console.log(`Ged 23 name: ${name}, val: ${JSONPath({path: key, json: data})[0]}`)
                        val = String(JSONPath({path: key, json: data})[0]);
                        // Make N/A if not found
                        if (!val)
                        {
                            val = wtconfig.get('ET.NotAvail', 'N/A');
                        }
                        val = etHelper.isEmpty( { "val": val } );
                        // Remove CR, LineFeed ' and " from the
                        // string if present, and replace with a space
                        val = val.replace(/'|"|\r|\n/g, ' ');
                        //val = val.replace(/\r|\n/g, ' ');
                        val = setStrSeperator( {str: val});
                        break;
                    case "array":
                        array = JSONPath({path: key, json: data});
                        if (array === undefined || array.length == 0) {
                            val = wtconfig.get('ET.NotAvail', 'N/A');
                        }
                        else
                        {
                            valArray = []
                            for (i=0; i<array.length; i++) {
                                switch(String(subType)) {
                                    case "string":
                                        valArrayVal = String(JSONPath({path: String(subKey), json: array[i]}));
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
                            /* if ( String(subType) == 'string')
                            {
                                val = textSep + val + textSep;
                            } */
                        }
                        console.log('Ged 44: ' + val)
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
                    console.log('GED LOOK INTO THIS ***** TODO *****')
                    if (!["Original Title","Sort title"].includes(name)){
                        const title = JSONPath({path: String('$.title'), json: data})[0];
                        val = await this.postProcess( {name: name, val: val, title: title} );
                    }
                    else {
                        val = await this.postProcess( {name: name, val: val} );
                    }
                }
                str += val + etHelper.intSep;
            }
        }
        catch (error)
        {
            log.error(`We had an exception in ethelper addRowToTmp as ${error}`);
            log.error(`Fields are name: ${name}, key: ${key}, type: ${type}, subType: ${subType}, subKey: ${subKey}`);
        }
        // Remove last internal separator
        const internalLength = etHelper.intSep.length;
        str = str.substring(0,str.length-internalLength);
        log.silly(`etHelper addRowToTmp returned: ${JSON.stringify(str)}`);
        str = str.replaceAll(this.intSep, wtconfig.get("ET.ColumnSep", '|'));
        return str;
    }

    async populateExpFiles(){
        log.info('Populating export files');
        // Current item counter in the chunck
        let idx = 0;
        // Chunck step
        const step = wtconfig.get("PMS.ContainerSize." + this.Settings.libType, 20);
        let size = 0;   // amount of items fetched each time
        let chunck; // placeholder for items fetched
        let chunckItems; // Array of items in the chunck
        this.Settings.element = this.getElement();
        let postURI = this.getPostURI();
        // Get the fields for this level

        do  // Walk section in steps
        {
            chunck = await this.getItemData({
                postURI: postURI + idx});
            size = JSONPath({path: '$.MediaContainer.size', json: chunck});
            log.silly(`Fetched a chunck with number of items as ${size} and contained: ${JSON.stringify(chunck)}`);
            chunckItems = JSONPath({path: '$.MediaContainer.Metadata.*', json: chunck});
            let tmpRow;
            // Walk each item retrieved
            for (var item in chunckItems)
            {
                if (this.Settings.call == 1)
                {
                    // Let's get the needed row


                    tmpRow = await this.addRowToTmp({ data: chunckItems[item], fields: this.Settings.fields});


                    if (this.Settings.csvFile){
                        console.log('Ged 12-4 We need to exp to CSV')
                        csv.addRowToTmp({ stream: this.Settings.csvStream, item: tmpRow})
                    }
                    if (this.Settings.xlsxFile){
                        console.log('Ged 12-4 We need to exp to XLSX')
                    }
                    //console.log('Ged 12-3: ' + JSON.stringify(chunckItems[item]))
                }
                else
                {
                    console.log('Ged 12-6 We need to call the item for more details')
                }
            }
            idx += step;
        } while (size == step);
    }

    async getSectionSize()
    {
        const url = this.Settings.baseURL + '/library/sections/' + this.Settings.selLibKey + '/all?X-Plex-Container-Start=0&X-Plex-Container-Size=0';
        this.PMSHeader["X-Plex-Token"] = this.Settings.accessToken;
        log.verbose(`Calling url in getSectionSize: ${url}`)
        let response = await fetch(url, { method: 'GET', headers: this.PMSHeader});
        let resp = await response.json();
        var totalSize = JSONPath({path: '$..totalSize', json: resp});
        log.silly(`Response in getSectionSize: ${totalSize}`);
        return totalSize;
    }

    async getItemData({ postURI=this.#_defpostURI })
    {
        const url = this.Settings.baseURL + this.Settings.element + postURI;
        this.PMSHeader["X-Plex-Token"] = this.Settings.accessToken;
        log.verbose(`Calling url in getItemData: ${url}`)
        let response = await fetch(url, { method: 'GET', headers: this.PMSHeader});
        let resp = await response.json();
        log.silly(`Response in getItemData: ${JSON.stringify(resp)}`)
        return resp
    }

    async getLevelCall () {
        if (this.Settings.libType == this.ETmediaType.Playlist)
        {
            this.Settings.libType = this.Settings.libTypeSec;
        }
        const count = await defLevels[this.Settings.libType]['LevelCount'][this.Settings.levelName]
        log.info('Count needed is: ' + count)
        return count
    }

    async exportMedias() {
        this.updateStatusMsg( this.#_RawMsgType.Status, i18n.t("Modules.ET.Status.Running"));
        this.updateStatusMsg( this.#_RawMsgType.StartTime, await this.getNowTime('start'));
        if ([ et.ETmediaType.Libraries, et.ETmediaType.Playlists].indexOf(this.Settings.libType) > -1)
        {
            this.Settings.levelName = 'All'
        }
        // Create outfiles and streams
        await this.createOutFile();
       // Now we need to find out how many calls to make
       this.Settings.call = await this.getLevelCall();

       // Get total size of the section
       this.Settings.totalItems = await this.getSectionSize();
       console.log('Ged 445: ' + this.Settings.totalItems)

        // Get items from PMS, and populate export files
       await this.populateExpFiles();

        
        await this.closeOutFile();

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

    async closeOutFile()
    {
        var fs = require('fs');
        let newFile;
        if (wtconfig.get("ET.ExpCSV", true)){
            this.Settings.csvStream.end();
            // Rename to real file name
            newFile = this.Settings.csvFile.replace('.tmp', '')
            fs.renameSync(this.Settings.csvFile, newFile);
        }
        if (wtconfig.get("ET.ExpExcel", false)){
            this.Settings.xlsxStream.end();
            // Rename to real file name
            newFile = this.Settings.xlsxFile.replace('.tmp', '')
            fs.renameSync(this.Settings.xlsxFile, newFile);
        }
    }

    async createOutFile()
    {
        // Get Header fields
        this.Settings.fields = await etHelper.getFieldHeader();
        var fs = require('fs');
        // Create CSV Stream
        if (wtconfig.get("ET.ExpCSV", true)){
            // Open a file stream
            this.Settings.csvFile = await etHelper.getFileName({ Type: 'csv' });
            this.Settings.csvStream = fs.createWriteStream(this.Settings.csvFile, {flags:'a'});
            //await this.getFileName({ Library: libName, Level: level, Type: 'tmp', Module: i18n.t('Modules.ET.Name'), exType: exType });
            await csv.addHeaderToTmp({ stream: this.Settings.csvStream, item: this.Settings.fields});
        }
        // Create XLSX Stream
        if (wtconfig.get("ET.ExpExcel", false)){
            // Open a file stream
            this.Settings.xlsxFile = await etHelper.getFileName({ Type: 'xlsx' });
            this.Settings.xlsxStream = fs.createWriteStream(this.Settings.xlsxFile, {flags:'a'});
            // TODO: Add XLS Header
            // await csv.addHeaderToTmp({ stream: this.Settings.csvStream, item: this.Settings.fields});
        }

        

/* 

        var sectionData, x;
        {
            sectionData, x

           // await etHelper.getAndSaveItemsToFile({stream: stream});
            
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


        }
         */
        
/* 
        // Need to export to xlsx as well?
        if (wtconfig.get('ET.ExpExcel')){
            log.info('We need to create an xlsx file as well');
            et.updateStatusMsg( et.rawMsgType.Info, i18n.t('Modules.ET.Status.CreateExlsFile'));
            await excel2.createXLSXFile( {csvFile: newFile, level: level, libType: libType, libName: libName, exType: exType, pListType: pListType});
        }
         */
    }

    async getAndSaveItemsToFile({stream: stream})
    {
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
                element = '/library/sections/' + this.Settings.selLibKey + '/all';
                break;
            case this.ETmediaType.Playlist:
                element = '/playlists/' + this.Settings.selLibKey;
                break;
            case this.ETmediaType.Libraries:
                element = '/library/sections/all';
                break;
            case this.ETmediaType.Playlists:
                element = '/playlists/all';
                break;
            default:
                element = '/library/sections/' + this.Settings.selLibKey + '/all';
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
    async clearStatus()
    {
        this.#_statusmsg = {};
        store.commit("UPDATE_SELECTEDETStatus", '');
        return;
    }

    async updateStatusMsg(msgType, msg)
    {
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
            if (isEmptyObj(this.#_FieldHeader))
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

    async getRunningTimeElapsed(){
        const now = new Date();
        let elapsedSeconds = Math.floor((now.getTime() - this.#_StartTime.getTime()) / 1000);
        let elapsedStr = elapsedSeconds.toString().replaceAll('.', '');
        const hours = Math.floor(parseFloat(elapsedStr) / 3600);
        elapsedSeconds = parseFloat(elapsedStr) - hours * 3600;
        const minutes = Math.floor(elapsedSeconds / 60);
        const seconds = elapsedSeconds - minutes * 60;
        return hours + ':' + minutes + ':' + seconds
    }
    //#endregion
}

export { etHelper };