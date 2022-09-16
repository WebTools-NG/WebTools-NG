// This file holds generic et functions
import {ipcRenderer} from 'electron';
import { wtconfig, wtutils } from '../../General/wtutils';
import store from '../../../../store';
import {csv} from './csv';
import {et} from './et';
import i18n from '../../../../i18n';
import filesize from 'filesize';
import Excel from 'exceljs';
import { status } from '../../General/status';
import { time } from '../../General/time';
import { tmdb } from '../../General/tmdb';
import { tvdb } from '../../General/tvdb';

var path = require("path");
var sanitize = require("sanitize-filename");

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

// Set Qualifier
function setQualifier( {str:str})
{
    const validQ = ["`", "'", "\""];
    let result = wtconfig.get('ET.TextQualifierCSV', 'N/A');
    if (str.indexOf(wtconfig.get('ET.TextQualifierCSV', 'N/A')) > -1)
    {
        let selectedQ;
        for(const val of validQ) {
            if ( val != wtconfig.get('ET.TextQualifierCSV', 'N/A'))
            {
                selectedQ = val;
                break;
            }
        }
        result = str.replaceAll(wtconfig.get('ET.TextQualifierCSV', 'N/A'), selectedQ);
        // Now remove fancy Return
        const ChReturn =  wtconfig.get('ET.ChReturn', '');
        if ( ChReturn != '')
        {
            result = result.replaceAll('\r', ChReturn);
        }
        // Now remove fancy NewLine
        const ChNewLine =  wtconfig.get('ET.ChNewLine', '');
        if ( ChNewLine != '')
        {
            result = result.replaceAll('\r', ChNewLine);
        }
        result = result.replaceAll('\n', wtconfig.get('ET.ChNewLine', '<NEWLINE>'));
    }
    else
    {
        result = `${wtconfig.get('ET.TextQualifierCSV', 'N/A')}${str}${wtconfig.get('ET.TextQualifierCSV', 'N/A')}`
    }
    log.debug(`[etHelper.js] (setQualifier) - Got: _WTNG_${str}_WTNG_ and returning ${result}`);
    return result;
}

// Clean up tmpFileName for suggested files/folders
// Remove leading and trailing spaces, as well as special characters
function cleanupSuggestedFile( tmpFileName )
{
    const unWantedChars = '.-*_[](){}';
    log.verbose(`[ethelper.js] (cleanupSuggestedFile) - starting Param: ${tmpFileName}`);
    // Now replace square brackets if present with a dot
    tmpFileName = tmpFileName.replaceAll("[", ".");
    tmpFileName = tmpFileName.replaceAll("]", ".");
    // Start by trimming the string
    tmpFileName = tmpFileName.trim();
    while ( unWantedChars.indexOf(tmpFileName.charAt(0)) > -1)
    {
        tmpFileName = tmpFileName.slice(1).trim();
        if ( tmpFileName.length === 0 ) break;
    }
    // Remove from end of the string
    while ( unWantedChars.indexOf(tmpFileName.charAt(tmpFileName.length-1)) > -1)
    {
        tmpFileName = tmpFileName.slice(0,-1).trim();
        if ( tmpFileName.length === 0 ) break;
    }
    // Now replace double dots if present with a single dot
    tmpFileName = tmpFileName.replaceAll("..", ".");
    // Now delete empty brackets
    tmpFileName = tmpFileName.replaceAll("()", "");
    tmpFileName = tmpFileName.replaceAll("{}", "");
    log.verbose(`[ethelper.js] (cleanupSuggestedFile) - Returning: ${tmpFileName}`);
    return tmpFileName;
}

// Returns a suggested title for a media
function getSuggestedTitle( data )
{
    let title;
    if (wtconfig.get('ET.suggestedUseOrigenTitle', false))
    {
        title = String(JSONPath({path: '$.data.originalTitle', json: data})).replace(/[/\\?%*:|"<>]/g, '').replace('  ', ' ');
    }
    else
    {
        title = String(JSONPath({path: '$.data.title', json: data})).replace(/[/\\?%*:|"<>]/g, '').replace('  ', ' ');
    }
    // Original selected, but none exist, we default to named title
    if ( title === '')
    {
        title = String(JSONPath({path: '$.data.title', json: data})).replace(/[/\\?%*:|"<>]/g, '').replace('  ', ' ');
    }
    return title;
}

// Returns a suggested year for a media
function getSuggestedYear( data )
{
    return String(JSONPath({path: '$.data.year', json: data}));
}

// Returns a suggested id for a media
function getSuggestedId( data )
{
    log.verbose(`[ethelper.js] (getSuggestedId) - Started. To see Param, switch to Silly logging`);
    log.silly(`[ethelper.js] (getSuggestedId) - Starting with param: ${JSON.stringify(data)}`);
    let imdb = `{imdb-${String(JSONPath({path: "$.data.Guid[?(@.id.startsWith('imdb'))].id", json: data})).substring(7,)}}`;
    if (imdb === '{imdb-}'){
        imdb = `{imdb-${String(JSONPath({path: "$.data.guid", json: data})).substring(26,).split('?')[0]}}`;
    }
    let tmdb = `{tmdb-${String(JSONPath({path: "$.data.Guid[?(@.id.startsWith('tmdb'))].id", json: data})).substring(7,)}}`;
    let tvdb = `{tvdb-${String(JSONPath({path: "$.data.Guid[?(@.id.startsWith('tvdb'))].id", json: data})).substring(7,)}}`;
    var Id;
    switch ( wtconfig.get("ET.SelectedMoviesID", "imdb") ){
        case 'imdb':
            Id = imdb;
            break;
        case 'tmdb':
            if (tmdb === '{tmdb-}'){
                Id = imdb;
            }
            else {
                Id = tmdb;
            }
            break;
    }
    log.debug(`[ethelper.js] (getSuggestedId) - Returning: "imdb": ${imdb}, "tmdb": ${tmdb}, "tvdb": ${tvdb}, "selId": ${Id}`);
    return {"imdb": imdb, "tmdb": tmdb, "tvdb": tvdb, "selId": Id};
}

// Returns a string stripped for Year
function stripYearFromFileName( tmpFileName, year ){
    const re = new RegExp(`\\b${year}\\b`, 'gi');
    return tmpFileName.replace(re, "").trim();
}

// Returns a string stripped for ID's
function stripIdFromFileName( param ){
    log.debug(`[ethelper.js] (stripIdFromFileName) - starting function with param as: ${JSON.stringify(param)}`);
    let tmpFileName = param.tmpFileName;
    const imdb = param.imdb;
    const tmdb = param.tmdb;
    const tvdb = param.tvdb;
    // Remove IMDB id
    log.debug(`[ethelper.js] (stripIdFromFileName) - Imdb string is : ${imdb}`);
    tmpFileName = tmpFileName.replaceAll(imdb, '');
    tmpFileName = tmpFileName.replaceAll(imdb.slice(6,-1), '');
    log.debug(`[ethelper.js] (stripIdFromFileName) - After imdb string is removed: ${tmpFileName}`);
    // Remove TMDB id
    tmpFileName = tmpFileName.replaceAll(tmdb, '');
    tmpFileName = tmpFileName.replaceAll(tmdb.slice(6,-1), '');
    // Remove TVDB id
    tmpFileName = tmpFileName.replaceAll(tvdb, '');
    tmpFileName = tmpFileName.replaceAll(tvdb.slice(6,-1), '');
    return tmpFileName.replace(`{-}`, "").trim();
}

// Returns a filename without the title
function stripTitleFromFileName( tmpFileName, title )
{
    let re;
    // Title in filename separated with dots
    let titleArray = tmpFileName.split(".");
    for (let titleElement of titleArray) {
        if (title.toUpperCase().indexOf(titleElement.toUpperCase()) > -1) {
            re = new RegExp(`\\b${titleElement}\\b`, 'gi');
            tmpFileName = tmpFileName.replace(re, "");
        }
        if (titleElement.toUpperCase() === 'AND')
        {
            titleElement = '&'
            if (title.toUpperCase().indexOf(titleElement.toUpperCase()) > -1) {
                re = new RegExp(`\\band\\b`, 'gi');
                tmpFileName = tmpFileName.replace(re, "");
            }
        }
    }
    // Title in filename separated with spaces
    titleArray = tmpFileName.split(" ");
    for (let titleElement of titleArray) {
        if (title.toUpperCase().indexOf(titleElement.toUpperCase()) > -1) {
            re = new RegExp(`\\b${titleElement}\\b`, 'gi');
            tmpFileName = tmpFileName.replace(re, "");
        }
        if (titleElement == '&')
        {
            titleElement = 'AND'
            if (title.toUpperCase().indexOf(titleElement.toUpperCase()) > -1) {
                re = new RegExp(`\\b${titleElement}\\b`, 'gi');
                tmpFileName = tmpFileName.replace(re, "");
            }
        }
    }
    tmpFileName = tmpFileName.trim();
    return tmpFileName;
}

// Strip parts from a filename, and return multiple values
function stripPartsFromFileName( tmpFileName, title ) {
    log.verbose(`[ethelper.js] (stripPartsFromFileName) - looking at ${tmpFileName}`);
    let partName = '';
    // Find stacked item if present
    etHelper.StackedFilesName.forEach(element => {
        // Got a hit?
        if (tmpFileName.toLowerCase().indexOf(element) > -1) {
            // Get index again
            const idx = tmpFileName.toLowerCase().indexOf(element);
            // Got a stacked identifier, so make sure next character is a number in [1-8] range
            const numStacked =  tmpFileName.charAt(idx + element.length);
            if (isNaN(numStacked)) {
                log.info(`[ethelper.js] (stripPartsFromFileName) - for the media with the title: "${title}" looking at the string: "${tmpFileName}" for stacked element: "${element}" but found next character not a number so ignorring`)
            }
            else
            {
                if (parseInt(numStacked, 10) < 9 && parseInt(numStacked, 10) > 0)
                {
                    // Extract element part, but add one char more for the counter
                    partName = tmpFileName.substring(idx, idx + element.length + 1).toLowerCase();
                }
                else
                {
                    log.warn(`[ethelper.js] (stripPartsFromFileName) - for the media with the title: "${title}" looking at the string: "${tmpFileName}" for stacked element: "${element}" but found entry not in range [1-8] so ignorring`)
                    log.warn(`[ethelper.js] (stripPartsFromFileName) - See: https://support.plex.tv/articles/naming-and-organizing-your-movie-media-files/`)
                }
            }
        }
    });

    // Remove partName from tmpFile
    // Get index of partName
    const idx = tmpFileName.toUpperCase().indexOf(partName.toUpperCase());
    tmpFileName = tmpFileName.slice(0, idx) + tmpFileName.slice(idx + partName.length);
    // Remove white spaces
    tmpFileName = tmpFileName.trim();
    if (tmpFileName.length === 1)
    {
        if (tmpFileName === '.'){
            tmpFileName = '';
        }
        if (tmpFileName === '-'){
            tmpFileName = '';
        }
    }
    log.verbose(`[ethelper.js] (stripPartsFromFileName) - Returning tmpFileName as: ${tmpFileName} *** Returning partName as: ${partName}`);
    return {
        fileName: tmpFileName,
        partName: partName
    };
}

//#endregion

const etHelper = new class ETHELPER {
    // Private Fields
    #_FieldHeader = [];
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
            totalItems: null,
            startItem: 0,
            endItem: null,
            count: 0,
            selType: null,
            fileMajor: null,
            fileMinor: null,
            element: null,
            SelectedMoviesID: null,
            SelectedShowsID: wtconfig.get("ET.SelectedShowsID", "tmdb"),
            showInfo: null,
            SelectedLibShowOrdering: null,
            tvdbBearer: null
        };

        this.PMSHeader = wtutils.PMSHeader;
        this.uriParams = 'checkFiles=1&includeAllConcerts=1&includeBandwidths=1&includeChapters=1&includeChildren=1&includeConcerts=1&includeExtras=1&includeFields=1&includeGeolocation=1&includeMarkers=1&includeLoudnessRamps=1&includeMarkers=1&includeOnDeck=1&includePopularLeaves=1&includePreferences=1&includeRelated=1&includeRelatedCount=1&includeReviews=1&includeStations=1';
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
        this.StackedFilesName = ['cd', 'disc', 'dvd', 'part', 'pt'];
        this.MetadataLang = {
            "": "Library default",
            "ar-SA": "Arabic (Saudi Arabia)",
            "bg-BG": "Bulgarian",
            "ca-ES": "Catalan",
            "zh-CN": "Chinese",
            "zh-HK": "Chinese (Hong Kong)",
            "zh-TW": "Chinese (Taiwan)",
            "hr-HR": "Croatian",
            "cs-CZ": "Czech",
            "da-DK": "Danish",
            "nl-NL": "Dutch",
            "en-US": "English",
            "en-AU": "English (Australia)",
            "en-CA": "English (Canada)",
            "en-GB": "English (UK)",
            "et-EE": "Estonian",
            "fi-FI": "Finnish",
            "fr-FR": "French",
            "fr-CA": "French (Canada)",
            "de-DE": "German",
            "el-GR": "Greek",
            "he-IL": "Hebrew",
            "hi-IN": "Hindi",
            "hu-HU": "Hungarian",
            "id-ID": "Indonesian",
            "it-IT": "Italian",
            "ja-JP": "Japanese",
            "ko-KR": "Korean",
            "lv-LV": "Latvian",
            "lt-LT": "Lithuanian",
            "nb-NO": "Norwegian Bokmål",
            "fa-IR": "Persian",
            "pl-PL": "Polish",
            "pt-BR": "Portuguese",
            "pt-PT": "Portuguese (Portugal)",
            "ro-RO": "Romanian",
            "ru-RU": "Russian",
            "sk-SK": "Slovak",
            "es-ES": "Spanish",
            "es-MX": "Spanish (Mexico)",
            "sv-SE": "Swedish",
            "th-TH": "Thai",
            "tr-TR": "Turkish",
            "uk-UA": "Ukrainian",
            "vi-VN": "Vietnamese"
        }
    }

    resetETHelper() {
        this.#_FieldHeader = [];
        this.Settings.Level = null;
        this.Settings.libType = null;
        this.Settings.outFile = null;
        this.Settings.baseURL = null;
        this.Settings.accessToken = null;
        this.Settings.levelName = null;
        this.Settings.csvFile = null;
        this.Settings.csvStream = null;
        this.Settings.xlsxFile = null;
        this.Settings.xlsxStream = null;
        this.Settings.call = null;
        this.Settings.fields = null;
        this.Settings.currentItem = 0;
        this.Settings.totalItems = null;
        this.Settings.SelectedLibShowOrdering = null;
        this.Settings.showInfo = null;
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

    /// This will return a suggested foldername, following Plex naming std
    async getSuggestedFolderName( data )
    {
        log.verbose(`[ethelper.js] (getSuggestedFolderName) - Starting function. To see param, use Silly log level`);
        log.silly(`[ethelper.js] (getSuggestedFolderName) - Data pased over as: ${JSON.stringify(data)}`);
        const title = getSuggestedTitle( data );
        const year = getSuggestedYear( data );
        const Id = getSuggestedId( data ).selId;
        // Get current folder name
        const curFolderName = path.basename(path.dirname(String(JSONPath({path: "$.data.Media[0].Part[0].file", json: data}))))
        // Compute suggested foldername
        let foldername = `${title} (${year}) ${Id}`;
        log.debug(`[ethelper.js] (getSuggestedFolderName) - Suggested folderName is: ${foldername}`);
        if (curFolderName === foldername) {
            return i18n.t("Modules.ET.FolderNameOK")
          }
        else {
            return foldername
        }
    }

    /// This will return a suggested filename, following Plex naming std
    async getSuggestedFileName( data )
    {
        const title = getSuggestedTitle( data );
        const year = getSuggestedYear( data );
        const Ids = getSuggestedId( data );
        const Id = Ids.selId;
        const imdb = Ids.imdb;
        const tmdb = Ids.tmdb;
        const tvdb = Ids.tvdb;

        // Get current filename
        const curFileName = path.parse(String(JSONPath({path: '$.data.Media[0].Part[0].file', json: data}))).name;

        // Compute suggested filename, and start by stripping known info from existing name

        // Start with the title
        let tmpFileName = stripTitleFromFileName( curFileName, title );
        // Strip Year from fileName
        tmpFileName = stripYearFromFileName( tmpFileName, year );
        // Strip ID from fileName
        tmpFileName = stripIdFromFileName( {tmpFileName: tmpFileName, imdb: imdb, tmdb: tmdb, tvdb: tvdb} );
        tmpFileName = cleanupSuggestedFile(tmpFileName);
        // Get parts, if a stacked media
        const parts = stripPartsFromFileName( tmpFileName, title );
        tmpFileName = parts.fileName;
        const partName = parts.partName;
        tmpFileName = cleanupSuggestedFile(tmpFileName);
        // Get filename part of remaining filename
        if (tmpFileName.length >= 1)
        {
            tmpFileName = `[${tmpFileName}]`
        }
        let suggestedFileName;
        if (wtconfig.get("ET.suggestedFileNoExtra", false))
        {
            suggestedFileName = `${title} (${year}) ${Id} ${partName}`.trim();
        }
        else
        {
            suggestedFileName = `${title} (${year}) ${Id} ${tmpFileName} ${partName}`.trim();
        }
        // Remove double space if present
        suggestedFileName = suggestedFileName.replaceAll("  ", " ");
        const fileNameExt = path.parse(String(JSONPath({path: '$.data.Media[0].Part[0].file', json: data}))).ext;
        suggestedFileName = `${suggestedFileName}${fileNameExt}`;
        log.debug(`[ethelper.js] (getSuggestedFileName) - returning ${suggestedFileName}`);
        if (curFileName === path.parse(suggestedFileName).name) {
            return i18n.t("Modules.ET.FileNameOK")
          }
        else {
            return suggestedFileName
        }
    }

    async getHash( data )
    {
        var ratingKey = JSONPath({path: '$..ratingKey', json: data})[0];
        const url = `${this.Settings.baseURL}/library/metadata/${ratingKey}/tree`;
        this.PMSHeader["X-Plex-Token"] = this.Settings.accessToken;
        log.verbose(`[ethelper.js] (getHash) Calling url in getItemDetails: ${url}`)
        let response = await fetch(url, { method: 'GET', headers: this.PMSHeader});
        let resp = await response.json();
        let hash = JSONPath({path: '$..hash', json: resp})
        return hash
    }

    async postProcess( {name, val, title="", data} ){
        log.debug(`[ethelper.js] (postProcess) - Val is: ${JSON.stringify(val)}`);
        log.debug(`[ethelper.js] (postProcess) - name is: ${name}`);
        log.debug(`[ethelper.js] (postProcess) - title is: ${title}`);
        let retArray = [];
        let guidArr;
        let x, retVal, start, strStart, end, result;
        try {
            const valArray = val.split(wtconfig.get('ET.ArraySep', ' * '));
            switch ( String(name) ){
                case "Audience Rating":
                        retVal = val.substring(0, 3);
                        break;
                case "Episode Count (Cloud)":
                    retVal = wtconfig.get('ET.NotAvail');
                    if ( this.Settings.showInfo['Episode Count (Cloud)']){
                        retVal = this.Settings.showInfo['Episode Count (Cloud)'];
                    }
                    break;
                case "Episode Count (PMS)":
                    this.Settings.showInfo['PMSEPCount'] = parseInt(val);
                    retVal = val;
                    break;
                case "Missing":
                    retVal = i18n.t('Common.Ok');
                    if ( this.Settings.showInfo['Episode Count (Cloud)'] != this.Settings.showInfo['PMSEPCount']){
                        retVal = "Episode mismatch"
                    }
                    if (!this.Settings.showInfo['Episode Count (Cloud)']){
                        retVal = "Guid problem found, please refresh metadata, or sort order not avail at cloud provider"
                    }
                    break;
                case "Rating":
                        retVal = val.substring(0, 3);
                        break;
                case "Suggested File Name":
                    retVal = await this.getSuggestedFileName( {data: data} );
                    break;
                case "Suggested Folder Name":
                    retVal = await this.getSuggestedFolderName( {data: data} );
                    break;
                case "Part File":
                    for (x=0; x<valArray.length; x++) {
                        retArray.push(path.basename(valArray[x]));
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
                        try{
                            retArray.push(filesize(valArray[x]));
                        }
                        catch (error)
                        {
                            log.error(`Error getting Part Size was ${error} for ${valArray[x]}`);
                        }
                    }
                    retVal = retArray.join(wtconfig.get('ET.ArraySep', ' * '));
                    break;
                case "Original Title":
                    if (wtconfig.get('ET.OrgTitleNull'))
                    {
                        log.debug(`[ethelper.js] (postProcess) We need to override Original Titel, if not avail`);
                        log.debug(`[ethelper.js] (postProcess) Got Original title as: ${val}`);
                        log.debug(`[ethelper.js] (postProcess) Alternative might be title as: ${title}`);
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
                    log.debug(`[ethelper.js] (postProcess) Original Title returned as: ${retVal}`)
                    break;
                case "Sort title":
                    if (wtconfig.get('ET.SortTitleNull'))
                    {
                        // Override with title if not found
                        if (val == wtconfig.get('ET.NotAvail'))
                        {
                            retVal = title;
                        }
                        else {
                            retVal = val;
                        }
                    }
                    else
                    {
                        if (val == 'undefined')
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
                case "Link (Cloud)":
                    retVal = wtconfig.get('ET.NotAvail');
                    if ( this.Settings.showInfo['Link (Cloud)']){
                        retVal = this.Settings.showInfo['Link (Cloud)'];
                    }
                    break;
                case "TVDB ID":
                    retVal = wtconfig.get('ET.NotAvail');
                    guidArr = val.split(wtconfig.get('ET.ArraySep'));
                    for(const item of guidArr) {
                        if ( item.startsWith("tvdb://") )
                        {
                            retVal = item.substring(7);
                        }
                    }
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
                    retVal = wtconfig.get('ET.NotAvail');
                    guidArr = val.split(wtconfig.get('ET.ArraySep'));
                    for(const item of guidArr) {
                        if ( item.startsWith("tmdb://") )
                        {
                            retVal = item.substring(7);
                        }
                    }
                    break;
                case "TMDB Link":
                    retVal = wtconfig.get('ET.NotAvail');
                    guidArr = val.split(wtconfig.get('ET.ArraySep'));
                    for(const item of guidArr) {
                        if ( item.startsWith("tmdb://") )
                        {
                            const mediaType = JSONPath({path: '$.type', json: data})[0];
                            if ( mediaType == 'movie'){
                                retVal = 'https://www.themoviedb.org/movie/' + item.substring(7);
                            }

                            /* else if ( mediaType == 'episode'){
                                const season = 1
                                const episode = 1
                                retVal = `https://www.themoviedb.org/tv/${item.substring(7)}/season/${season}/episode/${episode}`
                            }
                             */
                            else {
                                retVal = 'https://www.themoviedb.org/tv/' + item.substring(7);
                            }
                        }
                    }
                    break;
                case "PMS Media Path":
                    retVal = wtconfig.get('ET.NotAvail');
                    var hashes = await this.getHash(data);
                    var retHash = [];
                    hashes.forEach(hash => {
                        retHash.push(path.join('Media', 'localhost', hash[0], hash.slice(1) + '.bundle'));
                      });
                    retVal = retHash.join(wtconfig.get('ET.ArraySep', ' * '));
                    break;
                case "PMS Metadata Path":
                    retVal = wtconfig.get('ET.NotAvail');
                    var libTypeName;
                    switch ( String(this.RevETmediaType[this.Settings.libTypeSec]) ){
                        case "Movie":
                            libTypeName = 'Movies';
                            break;
                        case "Show":
                            libTypeName = 'TV Shows';
                            break;
                        case "Episode":
                            libTypeName = 'TV Shows';
                            // We need another guid sadly
                            val = JSONPath({path: '$..grandparentGuid', json: data})[0];
                            break;
                        case "Album":
                            libTypeName = 'Albums';
                            break;
                        case "Artist":
                            libTypeName = 'Artists';
                            break;
                    }
                    var crypto = require('crypto');
                    var shasum = crypto.createHash('sha1');
                    shasum.update(val);
                    var sha1 = shasum.digest('hex');
                    //var path = require('path');
                    retVal = path.join('Metadata', libTypeName, sha1[0], sha1.slice(1) + '.bundle');
                    break;
                case "Season Count (Cloud)":
                    retVal = wtconfig.get('ET.NotAvail');
                    if ( this.Settings.showInfo['Season Count (Cloud)']){
                        retVal = this.Settings.showInfo['Season Count (Cloud)'];
                    }
                    break;
                case "Season Count (PMS)":
                    this.Settings.showInfo['PMSSCount'] = parseInt(val);
                    retVal = val;
                    break;
                case "Seasons (Cloud)":
                    retVal = wtconfig.get('ET.NotAvail');
                    if ( this.Settings.showInfo['Seasons (Cloud)']){
                        retVal = JSON.stringify(this.Settings.showInfo['Seasons (Cloud)']);
                    }
                    break;
                case "Sort Season by":
                    retVal = this.Settings.showInfo['showOrdering'];
                    break;
                case "Show Prefs Episode sorting":
                    switch (val){
                        case "-1":
                            retVal = "Library default";
                            break;
                        case "0":
                            retVal = "Oldest first";
                            break;
                        case "1":
                            retVal = "Newest first";
                            break;
                        default:
                            retVal = wtconfig.get('ET.NotAvail');
                            break;
                    }
                    break;
                case "Show Prefs Keep":
                    switch (val){
                        case "0":
                            retVal = "All episodes";
                            break;
                        case "5":
                            retVal = "5 latest episodes";
                            break;
                        case "3":
                            retVal = "3 latest episodes";
                            break;
                        case "1":
                            retVal = "Latest episode";
                            break;
                        case "-3":
                            retVal = "Episodes added in the past 3 days";
                            break;
                        case "-7":
                            retVal = "Episodes added in the past 7 days";
                            break;
                        case "-30":
                            retVal = "Episodes added in the past 30 days";
                            break;
                        default:
                            retVal = wtconfig.get('ET.NotAvail');
                            break;
                    }
                    break;
                case "Show Prefs Delete episodes after playing":
                    switch (val){
                        case "0":
                            retVal = "Never";
                            break;
                        case "1":
                            retVal = "After a day";
                            break;
                        case "7":
                            retVal = "After a week";
                            break;
                        case "100":
                            retVal = "On next refresh";
                            break;
                        default:
                            retVal = wtconfig.get('ET.NotAvail');
                            break;
                    }
                    break;
                case "Show Prefs Seasons":
                    switch (val){
                        case "-1":
                            retVal = "Library default";
                            break;
                        case "0":
                            retVal = "Show";
                            break;
                        case "1":
                            retVal = "Hide";
                            break;
                        default:
                            retVal = wtconfig.get('ET.NotAvail');
                            break;
                    }
                    break;
                case "Show Prefs Episode ordering":
                    switch (val){
                        case wtconfig.get('ET.NotAvail'):
                            retVal = "Library default";
                            break;
                        case "tmdbAiring":
                            retVal = "The Movie Database (Aired)";
                            break;
                        case "aired":
                            retVal = "TheTVDB (Aired)";
                            break;
                        case "dvd":
                            retVal = "TheTVDB (DVD)";
                            break;
                        case "absolute":
                            retVal = "TheTVDB (Absolute)";
                            break;
                        default:
                            retVal = wtconfig.get('ET.NotAvail');
                            break;
                    }
                    break;
                case "Show Prefs Metadata language":
                    retVal = this.MetadataLang[val];
                    break;
                case "Show Prefs Use original title":
                    switch (val){
                        case "-1":
                            retVal = "Library default";
                            break;
                        case "0":
                            retVal = "No";
                            break;
                        case "1":
                            retVal = "Yes";
                            break;
                        default:
                            retVal = wtconfig.get('ET.NotAvail');
                            break;
                    }
                    break;
                case "Status (Cloud)":
                    retVal = wtconfig.get('ET.NotAvail');
                    if ( this.Settings.showInfo['Status (Cloud)']){
                        retVal = this.Settings.showInfo['Status (Cloud)'];
                    }
                    break;
                default:
                    log.error(`[ethelper.js] (postProcess) no hit for: ${name}`)
                    break;
            }
        } catch (error) {
            retVal = 'ERROR'
            log.error(`[ethelper.js] (postProcess) - We had an error as: ${error} . So postProcess retVal set to ERROR`);
        }
        return await retVal;
    }

    // Get library default show ordering
    async SelectedLibShowOrdering(){
        if (!this.Settings.SelectedLibShowOrdering){
            // We need to get the default for this library
            log.info(`[ethelper.js] (SelectedLibShowOrdering) - Getting default show ordering for library ${this.Settings.LibName}`);
            let url = `${this.Settings.baseURL}/library/sections/all?includePreferences=1`;
            this.PMSHeader["X-Plex-Token"] = this.Settings.accessToken;
            log.verbose(`[ethelper.js] (SelectedLibShowOrdering) Calling url: ${url}`);
            let response = await fetch(url, { method: 'GET', headers: this.PMSHeader});
            let resp = await response.json();
            this.Settings.SelectedLibShowOrdering = JSONPath({path: `$..Directory[?(@.key==${this.Settings.selLibKey})].Preferences.Setting[?(@.id=="showOrdering")].value`, json: resp})[0];
            log.info(`[ethelper.js] (SelectedLibShowOrdering) - Default show ordering for library is: ${this.Settings.SelectedLibShowOrdering}`);
        }
        return this.Settings.SelectedLibShowOrdering
    }

    // Get specific show ordering
    async getShowOrdering( { ratingKey } ){
        let url = `${this.Settings.baseURL}/library/metadata/${ratingKey}?includeGuids=0&includePreferences=1&checkFiles=0&includeRelated=0&includeExtras=0&includeBandwidths=0&includeChapters=0&excludeElements=Actor,Collection,Country,Director,Genre,Label,Mood,Producer,Similar,Writer,Role&excludeFields=summary,tagline`;
        this.PMSHeader["X-Plex-Token"] = this.Settings.accessToken;
        log.verbose(`[ethelper.js] (getShowOrdering) Calling url: ${url}`);
        let response = await fetch(url, { method: 'GET', headers: this.PMSHeader});
        let resp = await response.json();
        var showOrder = JSONPath({path: `$..Preferences.Setting[?(@.id=="showOrdering")].value`, json: resp})[0];
        if (showOrder != ""){
            this.Settings.showInfo['showOrdering'] = showOrder;
        } else {
            this.Settings.showInfo['showOrdering'] = await this.SelectedLibShowOrdering();
        }
    }

    async addRowToTmp( { data }) {
        if ( this.Settings.levelName == 'Find Missing Episodes'){
            this.Settings.showInfo = {};
            let id, ids, attributename;
            await this.getShowOrdering( { "ratingKey": data["ratingKey"] } );
            switch ( this.Settings.showInfo["showOrdering"] ) {
                case "tmdbAiring":
                    // Special level, so we need to get info from tmdb
                    log.info(`[ethelper.js] (addRowToTmp) - Level "Find Missing Episodes" selected, so we must contact tmdb`);
                    ids = JSONPath({ path: "$.Guid[?(@.id.startsWith('tmdb'))].id", json: data });
                    if ( ids.length != 1){
                        this.Settings.showInfo["Link (Cloud)"] = "**** ERROR ****";
                        log.error(`[ethelper.js] (addRowToTmp) - tmdb guid problem for ${JSONPath({ path: "$.title", json: data })}`);
                    } else {
                        id = String(JSONPath({ path: "$.Guid[?(@.id.startsWith('tmdb'))].id", json: data })).substring(7,);
                        if ( id ){
                            this.Settings.showInfo["Link (Cloud)"] = `https://www.themoviedb.org/tv/${id}`;
                            const TMDBInfo = await tmdb.getTMDBShowInfo({tmdbId: id, title: JSONPath({ path: "$.title", json: data })});
                            for( attributename in TMDBInfo){
                                this.Settings.showInfo[attributename] = TMDBInfo[attributename];
                            }
                        } else {
                            const title = JSONPath({ path: "$.title", json: data });
                            log.error(`[ethelper.js] (addRowToTmp) - No tmdb guid found for ${title}`);
                        }
                    }
                    this.Settings.showInfo["showOrdering"] = "TMDB Airing";
                    this.Settings.showInfo["Status"] = this.Settings.showInfo["TMDBStatus"];
                    break;
                case "aired":
                    // Special level, so we need to get info from tvdb
                    log.info(`[ethelper.js] (addRowToTmp) - Level "Find Missing Episodes" selected, so we must contact tvdb`);
                    ids = JSONPath({ path: "$.Guid[?(@.id.startsWith('tvdb'))].id", json: data });
                    if ( ids.length != 1){
                        this.Settings.showInfo["Link (Cloud)"] = "**** ERROR ****";
                        log.error(`[ethelper.js] (addRowToTmp) - tvdb guid problem for ${JSONPath({ path: "$.title", json: data })}`);
                    } else {
                        id = String(JSONPath({ path: "$.Guid[?(@.id.startsWith('tvdb'))].id", json: data })).substring(7,);
                        // Get TVDB Access Token
                        if (!this.Settings.tvdbBearer){
                            this.Settings.tvdbBearer = await tvdb.login();
                        }
                        if ( id ){
                            const showInfo = await tvdb.getTVDBShowAired( {tvdbId: id, bearer: this.Settings.tvdbBearer, title: JSONPath({ path: "$.title", json: data })} );
                            for( attributename in showInfo){
                                this.Settings.showInfo[attributename] = showInfo[attributename];
                            }
                        } else {
                            const title = JSONPath({ path: "$.title", json: data });
                            log.error(`[ethelper.js] (addRowToTmp) - No tmdb guid found for ${title}`);
                        }
                    }
                    this.Settings.showInfo["showOrdering"] = "TVDB Airing";
                    break;
                case "dvd":
                    // Special level, so we need to get info from tvdb
                    log.info(`[ethelper.js] (addRowToTmp) - Level "Find Missing Episodes" selected, so we must contact tvdb for DVD order`);
                    ids = JSONPath({ path: "$.Guid[?(@.id.startsWith('tvdb'))].id", json: data });
                    if ( ids.length != 1){
                        this.Settings.showInfo["Link (Cloud)"] = "**** ERROR ****";
                        log.error(`[ethelper.js] (addRowToTmp) - tvdb guid problem for ${JSONPath({ path: "$.title", json: data })}`);
                    } else {
                        id = String(JSONPath({ path: "$.Guid[?(@.id.startsWith('tvdb'))].id", json: data })).substring(7,);
                        // Get TVDB Access Token
                        if (!this.Settings.tvdbBearer){
                            this.Settings.tvdbBearer = await tvdb.login();
                        }
                        if ( id ){
                            const showInfo = await tvdb.getTVDBShowDVD( {tvdbId: id, bearer: this.Settings.tvdbBearer, title: JSONPath({ path: "$.title", json: data })} );
                            for( attributename in showInfo){
                                this.Settings.showInfo[attributename] = showInfo[attributename];
                            }
                        } else {
                            const title = JSONPath({ path: "$.title", json: data });
                            log.error(`[ethelper.js] (addRowToTmp) - No tmdb guid found for ${title}`);
                        }
                    }
                    this.Settings.showInfo["showOrdering"] = "TVDB DVD";
                    this.Settings.showInfo["Status"] = this.Settings.showInfo["TVDBStatus"];
                    break;
                case "absolute":
                    // Special level, so we need to get info from tvdb
                    log.info(`[ethelper.js] (addRowToTmp) - Level "Find Missing Episodes" selected, so we must contact tvdb`);
                    ids = JSONPath({ path: "$.Guid[?(@.id.startsWith('tvdb'))].id", json: data });
                    if ( ids.length != 1){
                        this.Settings.showInfo["Link (Cloud)"] = "**** ERROR ****";
                        log.error(`[ethelper.js] (addRowToTmp) - tvdb guid problem for ${JSONPath({ path: "$.title", json: data })}`);
                    } else {
                        id = String(JSONPath({ path: "$.Guid[?(@.id.startsWith('tvdb'))].id", json: data })).substring(7,);
                        // Get TVDB Access Token
                        if (!this.Settings.tvdbBearer){
                            this.Settings.tvdbBearer = await tvdb.login();
                        }

                        if ( id ){
                            const showInfo = await tvdb.getTVDBShowAbsolute( {tvdbId: id, bearer: this.Settings.tvdbBearer, title: JSONPath({ path: "$.title", json: data })} );
                            for( attributename in showInfo){
                                this.Settings.showInfo[attributename] = showInfo[attributename];
                            }
                        } else {
                            const title = JSONPath({ path: "$.title", json: data });
                            log.error(`[ethelper.js] (addRowToTmp) - No tmdb guid found for ${title}`);
                        }
                    }
                    this.Settings.showInfo["showOrdering"] = "TVDB Absolute";
                    this.Settings.showInfo["Status"] = this.Settings.showInfo["TVDBStatus"];
                    break;
            }
        }
        this.Settings.currentItem +=1;
        status.updateStatusMsg( status.RevMsgType.Items, i18n.t('Common.Status.Msg.ProcessItem_0_1', {count: this.Settings.count, total: this.Settings.endItem}));
        log.debug(`[ethelper.js] (addRowToTmp) Start addRowToTmp item ${this.Settings.currentItem} (Switch to Silly log to see contents)`)
        log.silly(`[ethelper.js] (addRowToTmp) Data is: ${JSON.stringify(data)}`)
        let name, key, type, subType, subKey, doPostProc;
        let date, year, month, day, hours, minutes, seconds;
        let val, array, i, valArray, valArrayVal
        let str = ''
        let textSep = wtconfig.get('ET.TextQualifierCSV', '"');
        if ( textSep === ' ')
        {
            textSep = '';
        }
        try
        {
            for (var x=0; x<this.Settings.fields.length; x++) {
                status.updateStatusMsg( status.RevMsgType.Items, i18n.t('Common.Status.Msg.ProcessItem_0_1', {count: this.Settings.count, total: this.Settings.endItem}));
                var fieldDef = JSONPath({path: '$.fields.' + this.Settings.fields[x], json: defFields})[0];
                name = this.Settings.fields[x];
                key = fieldDef["key"];
                type = fieldDef["type"];
                subType = fieldDef["subtype"];
                subKey = fieldDef["subkey"];
                doPostProc = fieldDef["postProcess"];
                switch(type) {
                    case "string":
                        val = String(JSONPath({path: key, json: data})[0]);
                        // Make N/A if not found
                        if (!val)
                        {
                            val = wtconfig.get('ET.NotAvail', 'N/A');
                        }
                        val = etHelper.isEmpty( { "val": val } );
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
                                                valArrayVal = await time.convertMsToTime(valArrayVal);
                                            }
                                        }
                                        break;
                                    default:
                                        log.error('[ethelper.js] (addRowToTmp) NO ARRAY HIT (addRowToSheet-array)')
                                }
                                valArray.push(valArrayVal)
                            }
                            val = valArray.join(wtconfig.get('ET.ArraySep', ' * '));
                        }
                        break;
                    case "array-count":
                        val = JSONPath({path: String(key), json: data}).length;
                        break;
                    case "int":
                        val = JSONPath({path: String(key), json: data})[0];
                        break;
                    case "time":
                        val = JSONPath({path: key, json: data});
                        if ( typeof val !== 'undefined' && val  && val != '')
                        {
                            val = await time.convertMsToTime(val);
                        }
                        else
                        {
                            val = wtconfig.get('ET.NotAvail', 'N/A')
                        }
                        break;
                    case "datetime":
                        val = JSONPath({path: key, json: data});
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
                if ( doPostProc )
                {
                    const title = JSONPath({path: String('$.title'), json: data})[0];
                    log.debug(`[ethelper.js] (addRowToTmp doPostProc) - Name is: ${name} - Title is: ${title} - Val is: ${val}`)
                    val = await this.postProcess( {name: name, val: val, title: title, data: data} );
                }
                // Here we add qualifier, if not a number
                if (!['array-count', 'int'].includes(type))
                {
                    val = setQualifier( {str: val} );
                }
                str += val + etHelper.intSep;
            }
        }
        catch (error)
        {
            log.error(`[ethelper.js] (addRowToTmp) - We had an exception as ${error}`);
            log.error(`[ethelper.js] (addRowToTmp) - Fields are name: ${name}, key: ${key}, type: ${type}, subType: ${subType}, subKey: ${subKey}`);
        }
        // Remove last internal separator
        str = str.substring(0,str.length-etHelper.intSep.length);
        str = str.replaceAll(this.intSep, wtconfig.get("ET.ColumnSep", '|'));
        status.updateStatusMsg( status.RevMsgType.TimeElapsed, await time.getTimeElapsed());
        log.debug(`etHelper (addRowToTmp) returned: ${JSON.stringify(str)}`);
        return str;
    }

    async getItemDetails( { key })
    {
        var include = await this.getIncludeInfo();
        if ( key.toString().endsWith("/children") ){
            key = key.toString().slice(0, -9);
        }
        let url = `${this.Settings.baseURL}${key}`;
        if ( include ){
            url = `${url}?${include}`;
        }
        this.PMSHeader["X-Plex-Token"] = this.Settings.accessToken;
        log.verbose(`[ethelper.js] (getItemDetails) Calling url in getItemDetails: ${url}`)
        let response = await fetch(url, { method: 'GET', headers: this.PMSHeader});
        let resp = await response.json();
        resp = JSONPath({path: '$.MediaContainer.Metadata.*', json: resp})[0];
        log.debug(`[ethelper.js] (getItemDetails) Response in getItemDetails: ${JSON.stringify(resp)}`);
        return resp
    }

    async forceDownload( { url: url, target: target, title: title } ) {
        let header = wtutils.PMSHeader;
        header['X-Plex-Token'] = store.getters.getSelectedServer.accessToken;

        const _this = this;
        return new Promise((resolve) => {
            try
            {
                _this.isDownloading = true;
                ipcRenderer.send('downloadFile', {
                    item: url,
                    filePath: target,
                    header: header
                })
            }
            catch (error)
            {
                log.error(`etHelper (forceDownload) downloading pic for ${title} cougth an exception as: ${error}`);
            }

            ipcRenderer.on('downloadEnd', () => {
                try
                {
                    ipcRenderer.removeAllListeners('downloadEnd');
                    ipcRenderer.removeAllListeners('downloadError');
                    resolve(target);
                }
                catch (error)
                {
                    log.error(`etHelper (forceDownload-downloadEnd) downloading pic for "${title}" caused an exception as: ${error}`);
                }
            })

            ipcRenderer.on('downloadError', (event, error) => {
                ipcRenderer.removeAllListeners('downloadEnd');
                ipcRenderer.removeAllListeners('downloadError');
                log.error(`etHelper (forceDownload-downloadError) downloading pic for "${title}" caused an exception as: ${error}`);
                let errorFile = path.join(path.dirname(target), '__ERROR__' + path.basename(target));
                errorFile = errorFile.replace('.jpg', '.txt');
                const fs = require('fs');
                try {
                    fs.writeFileSync( errorFile, `etHelper (forceDownload-downloadError) downloading pic for "${title}" caused an exception as: ${error}`, 'utf-8');
                }
                catch(e) {
                    log.error(`etHelper (forceDownload-downloadError) failed to save error file`);
                }
                resolve();
            })
        })
    }

    async populateExpFiles(){
        log.info('[etHelper] (populateExpFiles) - Populating export files');
        // Current item counter in the chunck
        //let idx = 0;
        let idx = this.Settings.startItem;
        this.Settings.count = idx;
        // Get status for exporting arts and posters
        const bExportPosters = wtconfig.get(`ET.CustomLevels.${this.Settings.libTypeSec}.Posters.${this.Settings.levelName}`, false);
        const bExportArt = wtconfig.get(`ET.CustomLevels.${this.Settings.libTypeSec}.Art.${this.Settings.levelName}`, false);
        const bSeasonPosters = wtconfig.get(`ET.CustomLevels.${this.Settings.libTypeSec}.SeasonPosters.${this.Settings.levelName}`, false);
        const bShowPosters = wtconfig.get(`ET.CustomLevels.${this.Settings.libTypeSec}.ShowPosters.${this.Settings.levelName}`, false);
        const bShowArt = wtconfig.get(`ET.CustomLevels.${this.Settings.libTypeSec}.ShowArt.${this.Settings.levelName}`, false);
        // Chunck step
        const step = wtconfig.get("PMS.ContainerSize." + this.Settings.libType, 20);
        let size = 0;   // amount of items fetched each time
        let chunck; // placeholder for items fetched
        let chunckItems; // Array of items in the chunck
        this.Settings.element = this.getElement();
//        let postURI = this.getPostURI();
        // Get the fields for this level
        do  // Walk section in steps
        {
            //chunck = await this.getItemData({postURI: postURI + idx});
            chunck = await this.getSectionData();
            size = JSONPath({path: '$.MediaContainer.size', json: chunck});
            log.debug(`etHelper(populateExpFiles) - Fetched a chunck with number of items as ${size} and contained: ${JSON.stringify(chunck)}`);
            if ( this.Settings.libType == this.ETmediaType.Libraries)
            {
                chunckItems = JSONPath({path: '$.MediaContainer.Directory.*', json: chunck});
            }
            else
            {
                chunckItems = JSONPath({path: '$.MediaContainer.Metadata.*', json: chunck});
            }
            let tmpRow;
            // Walk each item retrieved
            for (var item in chunckItems)
            {
                //ProcessItem
                if (parseInt(this.Settings.call, 10) === 1)
                {
                    // Let's get the needed row
                    tmpRow = await this.addRowToTmp({ data: chunckItems[item]});
                    if (this.Settings.csvFile){
                        csv.addRowToTmp({ stream: this.Settings.csvStream, item: tmpRow})
                    }
                    if (this.Settings.xlsxFile){
                        console.log('Ged 12-4 We need to exp to XLSX')
                    }
                }
                else
                {
                    let key = JSONPath({path: '$.key', json: chunckItems[item]});
                    const details = await this.getItemDetails( { key: key });
                    // Let's get the needed row
                    tmpRow = await this.addRowToTmp({ data: details});
                    if (this.Settings.csvFile){
                        csv.addRowToTmp({ stream: this.Settings.csvStream, item: tmpRow})
                    }
                    if (this.Settings.xlsxFile){
                        console.log('Ged 12-4 We need to exp to XLSX')
                    }
                }
                if (bExportPosters)
                {
                    await this.exportPics( { type: 'posters', data: chunckItems[item] } )
                }
                if (bExportArt)
                {
                    await this.exportPics( { type: 'art', data: chunckItems[item] } )
                }
                if (bSeasonPosters)
                {
                    await this.exportPics( { type: 'seasonposters', data: chunckItems[item] } )
                }
                if (bShowPosters)
                {
                    await this.exportPics( { type: 'showposters', data: chunckItems[item] } )
                }
                if (bShowArt)
                {
                    await this.exportPics( { type: 'showart', data: chunckItems[item] } )
                }
                ++this.Settings.count;
                if ( this.Settings.count >= this.Settings.endItem) {
                    break;
                }
            }
            idx = Number(idx) + Number(step);
        } while (this.Settings.count < this.Settings.endItem);
        log.info('[ethelper.js] (populateExpFiles) - Populating export files ended');
    }

    async getSectionSize()
    {
        log.debug(`[etHelper] (getSectionSize) - selType: ${this.Settings.selType}`)
        log.debug(`[etHelper] (getSectionSize) - libTypeSec: ${this.Settings.libTypeSec}`)
        let url = '';
        switch(this.Settings.selType) {
            case this.ETmediaType.Playlist_Video:
              url = this.Settings.baseURL + '/playlists/' + this.Settings.selLibKey + '/items?';
              break;
            case this.ETmediaType.Playlist_Audio:
                url = this.Settings.baseURL + '/playlists/' + this.Settings.selLibKey + '/items?';
                break;
            case this.ETmediaType.Playlist_Photo:
                url = this.Settings.baseURL + '/playlists/' + this.Settings.selLibKey + '/items?';
                break;
            case this.ETmediaType.Playlists:
                url = this.Settings.baseURL + '/playlists?';
                break;
            case this.ETmediaType.Episode:
                url = this.Settings.baseURL + '/library/sections/' + this.Settings.selLibKey + '/all?type=' + this.ETmediaType.Episode + '&';
                break;
            case this.ETmediaType.Libraries:
                url = this.Settings.baseURL + '/library/sections?'
                break;
            case this.ETmediaType.Album:
                url = this.Settings.baseURL + '/library/sections/' + this.Settings.selLibKey + '/all?type=' + this.ETmediaType.Album + '&';
                break;
            case this.ETmediaType.Track:
                url = this.Settings.baseURL + '/library/sections/' + this.Settings.selLibKey + '/all?type=' + this.ETmediaType.Track + '&';
                break;
            case this.ETmediaType.Artist:
                url = this.Settings.baseURL + '/library/sections/' + this.Settings.selLibKey + '/all?type=' + this.ETmediaType.Artist + '&';
                break;
            default:
              // code block
              url = this.Settings.baseURL + '/library/sections/' + this.Settings.selLibKey + '/all?';
          }
        url += 'X-Plex-Container-Start=0&X-Plex-Container-Size=0';
        this.PMSHeader["X-Plex-Token"] = this.Settings.accessToken;
        log.verbose(`[etHelper] (getSectionSize) Calling url in getSectionSize: ${url}`)
        let response = await fetch(url, { method: 'GET', headers: this.PMSHeader});
        let resp = await response.json();
        var totalSize = JSONPath({path: '$..totalSize', json: resp})[0];
        log.debug(`[etHelper] (getSectionSize) Response in getSectionSize: ${totalSize}`);
        return totalSize;
    }

    async getSectionData()
    {
        log.debug(`[etHelper] (getSectionData) - Element is: ${this.Settings.element}`)
        //const url = this.Settings.baseURL + this.Settings.element + '?' + this.getPostURI() + this.Settings.count;
        const url = this.Settings.baseURL + this.Settings.element + this.getPostURI() + this.Settings.count;
        this.PMSHeader["X-Plex-Token"] = this.Settings.accessToken;
        log.verbose(`[etHelper] (getSectionData) - Calling url in getSectionData: ${url}`)
        let response = await fetch(url, { method: 'GET', headers: this.PMSHeader});
        let resp = await response.json();
        log.debug(`[etHelper] (getSectionData) - Response in getSectionData: ${JSON.stringify(resp)}`)
        return resp
    }

    async getLevelCall () {
        if (this.Settings.libType == this.ETmediaType.Playlist)
        {
            this.Settings.libType = this.Settings.libTypeSec;
        }
        log.debug(`[etHelper] (getLevelCall) - LibType: ${this.Settings.libTypeSec} * LevelName: ${this.Settings.levelName}`);
        let count = await defLevels[this.Settings.libTypeSec]['LevelCount'][this.Settings.levelName]
        if (count == undefined)
        {
            // We are dealing with a custom level
            log.debug('[etHelper] (getLevelCall) Count requested for a custom level')
            count = wtconfig.get(`ET.CustomLevels.${this.Settings.libTypeSec}.LevelCount.${this.Settings.levelName}`);
        }
        log.info('[etHelper] (getLevelCall) Count needed is: ' + count)
        return count
    }

    async exportMedias() {
        await time.setStartTime();
        status.updateStatusMsg( status.RevMsgType.Status, i18n.t("Common.Status.Msg.Processing"));
        status.updateStatusMsg( status.RevMsgType.StartTime, (await time.getStartTimeLocal()).toString());
        if ([ et.ETmediaType.Libraries, et.ETmediaType.Playlists].indexOf(this.Settings.libType) > -1)
        {
            this.Settings.levelName = 'All'
        }
        // Create outfiles and streams
        await this.createOutFile();
        // Now we need to find out how many calls to make
        this.Settings.call = await this.getLevelCall();
        // Get items from PMS, and populate export files
        await this.populateExpFiles();
        await this.closeOutFile();
        // Update status window
        status.clearStatus();
        await time.setEndTime();
        status.updateStatusMsg( status.RevMsgType.Status, i18n.t("Common.Status.Msg.Finished"));
        status.updateStatusMsg( status.RevMsgType.StartTime, (await time.getStartTimeLocal()).toString());
        status.updateStatusMsg( status.RevMsgType.EndTime, (await time.getEndTimeLocal()).toString());
        status.updateStatusMsg( status.RevMsgType.TimeElapsed, await time.getTimeDifStartEnd());
        status.updateStatusMsg( status.RevMsgType.OutFile, this.Settings.outFile);
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
        if (wtconfig.get("ET.ExpXLSX", false)){
            this.Settings.xlsxStream.end();
            // Rename to real file name
            newFile = this.Settings.xlsxFile.replace('.tmp', '')
            fs.renameSync(this.Settings.xlsxFile, newFile);
        }
        this.Settings.outFile = newFile;
    }

    async getExportPicsUrlandFileFileName( { type: extype, data: data, res: res} ) { // Get Art/Poster filename
        let key = String(JSONPath({path: '$.ratingKey', json: data})[0]);
        let title, show, season, seasonNumber, episodeNumber, year;
        let fileName = '';
        let ExpDir;
        if ( wtconfig.get('ET.ExportPostersArtsTree', true)){
            let filePath;
            let mediaType = JSONPath({path: '$.type', json: data})[0];
            switch (mediaType) {
                case 'episode':
                    switch (extype) {
                        case 'posters':
                            show = sanitize(JSONPath({path: '$.grandparentTitle', json: data})[0]);
                            title = sanitize(JSONPath({path: '$.title', json: data})[0]);
                            seasonNumber = await JSONPath({path: '$.parentIndex', json: data})[0];
                            if ( String(seasonNumber).length < 2){
                                seasonNumber = '0' + seasonNumber;
                            }
                            season = `Season ${seasonNumber}`;
                            episodeNumber = JSONPath({path: '$.index', json: data})[0];
                            if ( String(episodeNumber).length < 2){
                                episodeNumber = '0' + episodeNumber;
                            }
                            title = `${show} -S${seasonNumber}E${episodeNumber}- ${title}`;
                            filePath = path.join(show, season);
                            break;
                        case 'seasonposters':
                            show = sanitize(JSONPath({path: '$.grandparentTitle', json: data})[0]);
                            title = sanitize(JSONPath({path: '$.title', json: data})[0]);
                            seasonNumber = await JSONPath({path: '$.parentIndex', json: data})[0];
                            if ( String(seasonNumber).length < 2){
                                seasonNumber = '0' + seasonNumber;
                            }
                            season = `Season ${seasonNumber}`;
                            episodeNumber = JSONPath({path: '$.index', json: data})[0];
                            if ( String(episodeNumber).length < 2){
                                episodeNumber = '0' + episodeNumber;
                            }
                            title = `Season${seasonNumber}`;
                            filePath = path.join(show, season);
                            break;
                        case 'art':
                            show = sanitize(JSONPath({path: '$.grandparentTitle', json: data})[0]);
                            title = sanitize(JSONPath({path: '$.title', json: data})[0]);
                            seasonNumber = await JSONPath({path: '$.parentIndex', json: data})[0];
                            if ( String(seasonNumber).length < 2){
                                seasonNumber = '0' + seasonNumber;
                            }
                            season = `Season ${seasonNumber}`;
                            episodeNumber = JSONPath({path: '$.index', json: data})[0];
                            if ( String(episodeNumber).length < 2){
                                episodeNumber = '0' + episodeNumber;
                            }
                            title = `${show} -S${seasonNumber}E${episodeNumber}- ${title} -art`;
                            filePath = path.join(show, season);
                            break;
                        case 'showposters':
                            filePath = sanitize(JSONPath({path: '$.grandparentTitle', json: data})[0]);
                            title = `show`;
                            break;
                        case 'showart':
                            filePath = sanitize(JSONPath({path: '$.grandparentTitle', json: data})[0]);
                            title = `show -Art`;
                            break;
                    }
                    break;
                case 'movie':
                    switch (extype) {
                        case 'posters':
                            title = sanitize(JSONPath({path: '$.title', json: data})[0]);
                            year = JSONPath({path: '$.year', json: data})[0];
                            filePath = `${title} (${year})`;
                            title = filePath
                            break;
                        case 'art':
                            title = sanitize(JSONPath({path: '$.title', json: data})[0]);
                            year = JSONPath({path: '$.year', json: data})[0];
                            filePath = `${title} (${year})`;
                            title = `${filePath} -art`;
                            break;
                    }
                    break;
                case 'show':
                    switch (extype) {
                        case 'posters':
                            title = sanitize(JSONPath({path: '$.title', json: data})[0]);
                            filePath = title;
                            break;
                        case 'art':
                            title = sanitize(JSONPath({path: '$.title', json: data})[0]);
                            filePath = title;
                            title = `${title} -art`;
                            break;
                    }
                    break;
            }
            ExpDir = path.join(
                wtconfig.get('General.ExportPath'),
                wtutils.AppName,
                sanitize(i18n.t('Modules.ET.Name')),
                sanitize(i18n.t('Modules.ET.ExportPostersArts')),
                sanitize(i18n.t('Modules.ET.ExportPostersArtsTree')),
                sanitize(store.getters.getSelectedServer['name']),
                sanitize(this.Settings.LibName),
                filePath);
        } else  {
            switch (extype) {
                case 'seasonposters':
                    show = sanitize(JSONPath({path: '$.grandparentTitle', json: data})[0]);
                    season = sanitize(JSONPath({path: '$.parentTitle', json: data})[0]);
                    title = `${show}_${season}`;
                    break;
                case 'showposters':
                    show = sanitize(JSONPath({path: '$.grandparentTitle', json: data})[0]);
                    title = `${show}`;
                    break;
                case 'showart':
                    show = sanitize(JSONPath({path: '$.grandparentTitle', json: data})[0]);
                    title = `${show}`;
                    break;
                case 'showart2':
                    show = sanitize(JSONPath({path: '$.grandparentArt', json: data})[0]);
                    title = `${show}`;
                    break;
                default:
                    title = String(JSONPath({path: '$.title', json: data})[0]);
                    title = `${key}_${title.replace(/[/\\?%*:|"<>]/g, ' ').trim()}`;
                    break;
                }
            ExpDir = path.join(
                wtconfig.get('General.ExportPath'),
                wtutils.AppName,
                i18n.t('Modules.ET.Name'),
                i18n.t('Modules.ET.ExportPostersArts'),
                i18n.t('Modules.ET.ExportPostersArtsFlat'),
                extype);
        }
        // Also create exp dir if it doesn't exists
        // Create export dir
        var fs = require('fs');
        if (!fs.existsSync(ExpDir)){
            fs.mkdirSync(ExpDir, { recursive: true });
        }
        if ( res ){
            // Remove whitespace
            res = res.replace(/\s/g, "");
            fileName = `${title}_${res}`;
        } else {
            fileName = title;
        }
        let outFile = path.join(
            ExpDir,
            fileName + '.jpg'
        );
        log.debug(`[ethelper.js] (getExportPicsUrlandFileFileName) - Outfile is: ${outFile}`);
        return outFile;
    }

    async getExportPicsUrlandFile( { type: extype, data: data} ) {
        const ArtPostersOrigen = wtconfig.get('ET.ArtPostersOrigen', false);
        let resp = [];
        let picUrl = '';
        let entry = {};
        let resolutions;
        switch ( extype ) {
            case 'posters':
                picUrl = String(JSONPath({path: '$.thumb', json: data})[0]);
                resolutions = wtconfig.get('ET.Posters_Dimensions', '75*75').split(',');
                break;
            case 'art':
                picUrl = String(JSONPath({path: '$.art', json: data})[0]);
                resolutions = wtconfig.get('ET.Art_Dimensions', '75*75').split(',');
                break;
            case 'seasonposters':
                picUrl = String(JSONPath({path: '$.parentThumb', json: data})[0]);
                resolutions = wtconfig.get('ET.Posters_Dimensions', '75*75').split(',');
                break;
            case 'showposters':
                picUrl = String(JSONPath({path: '$.grandparentThumb', json: data})[0]);
                resolutions = wtconfig.get('ET.Posters_Dimensions', '75*75').split(',');
                break;
            case 'showart':
                picUrl = String(JSONPath({path: '$.grandparentArt', json: data})[0]);
                resolutions = wtconfig.get('ET.Art_Dimensions', '75*75').split(',');
                break;
        }
        if ( ArtPostersOrigen ) {  // Export in origen resolution
            entry['url'] = `${this.Settings.baseURL}${picUrl}`;
            entry['outFile'] = await this.getExportPicsUrlandFileFileName( { type: extype, data: data} );
            resp.push(entry);
        } else {  // Export in defined resolutions
            for(let res of resolutions) {
                entry = {};
                res = res.replace('*', 'x');
                // Build up pic url
                const hight = res.split('x')[1].trim();
                const width = res.split('x')[0].trim();
                entry['url'] = `${this.Settings.baseURL}/photo/:/transcode?width=${width}&height=${hight}&minSize=1&url=${picUrl}`;
                log.verbose(`[etHelper] (exportPics) Url for ${extype} is ${entry['url']}`);
                entry['outFile'] = await this.getExportPicsUrlandFileFileName( { type: extype, data: data, res: res} );
                resp.push(entry);
            }
        }
        return resp;
    }

    async exportPics( { type: extype, data: data} ) {
        let files = await this.getExportPicsUrlandFile( { type: extype, data: data} );
        let title = String(JSONPath({path: '$.title', json: data})[0]);
        for (var idx in files){
            log.silly(`[ethelper.js] (exportPics) - downloading ${files[idx]['url']} as file ${files[idx]['outFile']} with a title as ${title}`)
            await this.forceDownload( { url:files[idx]['url'], target:files[idx]['outFile'], title:title} );
        }
    }

    async createOutFile()
    {
        if (this.Settings.libType == this.ETmediaType.Libraries)
        {
            this.Settings.LibName = 'All';
        }
        // Get Header fields
        this.Settings.fields = await etHelper.getFieldHeader();
        var fs = require('fs');
        // Create CSV Stream
        if (wtconfig.get("ET.ExpCSV", true)){
            // Open a file stream
            this.Settings.csvFile = await etHelper.getFileName({ Type: 'csv' });
            this.Settings.csvStream = fs.createWriteStream(this.Settings.csvFile, {flags:'a'});
            await csv.addHeaderToTmp({ stream: this.Settings.csvStream, item: this.Settings.fields});
        }
        try
        {
            // Create XLSX Stream
            if (wtconfig.get("ET.ExpXLSX", false)){
                //const Excel = require('exceljs');
                // Open a file stream

                this.Settings.xlsxFile = await etHelper.getFileName({ Type: 'xlsx' });

                //this.Settings.xlsxStream = fs.createWriteStream(this.Settings.xlsxFile, {flags:'a'});
                // construct a streaming XLSX workbook writer with styles and shared strings
                const options = {
                    filename: this.Settings.xlsxFile,
                    useStyles: true,
                    useSharedStrings: true
                };
                var streamGed = new Excel.stream.xlsx();
                streamGed




                this.Settings.xlsxStream = new Excel.stream.xlsx.WorkbookWriter(options);

                // TODO: Add XLS Header
                // await csv.addHeaderToTmp({ stream: this.Settings.csvStream, item: this.Settings.fields});
            }
        }
        catch (error){
            log.error(`[etHelper] (createOutFile) Exception happened when creating xlsx stream as: ${error}`);
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
        if (wtconfig.get('ET.ExpXLSX')){
            log.info('We need to create an xlsx file as well');
            et.updateStatusMsg( et.rawMsgType.Info, i18n.t('Modules.ET.Status.CreateExlsFile'));
            await excel2.createXLSXFile( {csvFile: newFile, level: level, libType: libType, libName: libName, exType: exType, pListType: pListType});
        }
         */
    }

    // Generate the filename for an export
    async getFileName({ Type }){
        if (this.Settings.libTypeSec == this.ETmediaType.Playlists)
        {
            this.Settings.LibName = 'All Playlists';
        }
        const dateFormat = require('dateformat');
        const OutDir = wtconfig.get('General.ExportPath');
        const timeStamp=dateFormat(new Date(), "yyyy.mm.dd_h.MM.ss");
        const path = require('path');
        let arrFile = [];
        arrFile.push(sanitize(store.getters.getSelectedServer.name));
        arrFile.push(sanitize(this.Settings.LibName));
        arrFile.push(this.Settings.fileMajor);
        arrFile.push(this.Settings.fileMinor);
        arrFile.push(this.Settings.levelName);
        if (!wtconfig.get('ET.NoItemRange', false)){
            arrFile.push('Item ' + this.Settings.startItem + '-' + this.Settings.endItem);
        }
        if (!wtconfig.get('ET.NoTimeStamp', false)){
            arrFile.push(timeStamp);
        }
        this.Settings.outFile = arrFile.join('_') + '.' + Type + '.tmp';
        // Remove unwanted chars from outfile name
        const targetDir = path.join(
            OutDir, wtutils.AppName, i18n.t('Modules.ET.Name'));
        const outFileWithPath = path.join(
            targetDir, this.Settings.outFile);
        // Make sure target dir exists
        const fs = require('fs')
        if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
        }
        log.info(`etHelper (getFileName) OutFile ET is ${outFileWithPath}`);
        return outFileWithPath;
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
            subItem['location'] = JSONPath({path: '$..Location', json: section})[0];
            result.push(subItem)
        }
        await Promise.resolve(result);
        if ([this.ETmediaType.Playlist_Audio, this.ETmediaType.Playlist_Video].includes(this.Settings.selType))
        {
            url = address + '/playlists/all?type=15&sort=lastViewedAt:desc&playlistType=video,audio'
        }
        else
        {
            url = address + '/playlists'
        }
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

    getElement(){
        let element
        switch (this.Settings.libTypeSec) {
            case this.ETmediaType.Playlist_Photo:
                element = `/playlists/${this.Settings.selLibKey}/items`;
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
            case this.ETmediaType.Playlist_Audio:
                element = `/playlists/${this.Settings.selLibKey}/items`;
                break;
            case this.ETmediaType.Playlist_Video:
                element = `/playlists/${this.Settings.selLibKey}/items`;
                break;
            default:
                element = `/library/sections/${this.Settings.selLibKey}/all`;
        }
        log.debug(`Got element as ${element}`);
        return element;
    }

    getIncludeInfo(){
        let includeInfo;
        log.debug(`[ethelper.js] (getIncludeInfo) - Started. libTypeSec is: ${this.Settings.libTypeSec} and levelName is: ${this.Settings.levelName}`);
        try {
            includeInfo = defLevels[this.Settings.libTypeSec]['Include'][this.Settings.levelName];
        }
        catch (error) {
            includeInfo = ''
        }
        if (includeInfo == 'undefined')
        {
            // Check if we have a custom level
            includeInfo = wtconfig.get(`ET.CustomLevels.${this.Settings.libTypeSec}.Include.${this.Settings.levelName}`, '');
        }
        if (includeInfo == undefined)
        {
            // Check if we have a custom level
            includeInfo = wtconfig.get(`ET.CustomLevels.${this.Settings.libTypeSec}.Include.${this.Settings.levelName}`, '');
        }
        if (includeInfo == null)
        {
            // Check if we have a custom level
            includeInfo = wtconfig.get(`ET.CustomLevels.${this.Settings.libTypeSec}.Include.${this.Settings.levelName}`, '');
        }
        log.debug(`[ethelper.js] (getIncludeInfo) - returning: ${includeInfo}`);
        return includeInfo;
    }

    getPostURI(){
        let postURI, includeInfo;
        // Find LibType steps
        const step = wtconfig.get("PMS.ContainerSize." + this.Settings.libType, 20);
        log.debug(`etHelper (getPostURI) - Got Step size as: ${step}`);
        log.debug(`etHelper (getPostURI) - libType is: ${this.Settings.libType}`);
        log.debug(`etHelper (getPostURI) - libTypeSec is: ${this.Settings.libTypeSec}`);
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
            case this.ETmediaType.Playlist_Audio:
                postURI = `?X-Plex-Container-Size=${step}&X-Plex-Container-Start=`
                break;
            case this.ETmediaType.Playlist_Photo:
                postURI = `?X-Plex-Container-Size=${step}&X-Plex-Container-Start=`
                break;
            case this.ETmediaType.Playlist_Video:
                postURI = `?X-Plex-Container-Size=${step}&X-Plex-Container-Start=`
                break;
            default:
                includeInfo = this.getIncludeInfo();
                log.debug(`etHelper (getPostURI) - includeInfo is: ${includeInfo}`);
                if (includeInfo != '')
                {
                    postURI = `?X-Plex-Container-Size=${step}&type=${this.Settings.libTypeSec}&${includeInfo}&X-Plex-Container-Start=`;
                }
                else
                {
                    postURI = `?X-Plex-Container-Size=${step}&type=${this.Settings.libTypeSec}&X-Plex-Container-Start=`;
                }
        }
        log.debug(`etHelper (getPostURI) - Returning postURI as ${postURI}`);
        return postURI;
    }

    async getLevelFields() {
        // return fields in a level
        log.info('getLevelFields requested');
        return new Promise((resolve) => {
            const out = [];
            if (this.Settings.libType == etHelper.ETmediaType.Playlist)
            {
                this.Settings.libType = etHelper.Settings.libTypeSec;
            }
            log.debug(`etHelper (getLevelFields) libTypeSec is: ${this.Settings.libTypeSec}`);
            // We need to load fields and defs into def var
            switch(this.Settings.libTypeSec) {
                case etHelper.ETmediaType.Movie:
                    def = JSON.parse(JSON.stringify(require('./../defs/def-Movie.json')));
                    break;
                case etHelper.ETmediaType.Episode:
                    def = JSON.parse(JSON.stringify(require('./../defs/def-Episode.json')));
                    break;
                case etHelper.ETmediaType.Show:
                    // code block
                    def = JSON.parse(JSON.stringify(require('./../defs/def-Show.json')));
                    break;
                case etHelper.ETmediaType.Artist:
                    // code block
                    def = JSON.parse(JSON.stringify(require('./../defs/def-Artist.json')));
                    break;
                case etHelper.ETmediaType.Track:
                    // code block
                    def = JSON.parse(JSON.stringify(require('./../defs/def-Track.json')));
                    break;
                case etHelper.ETmediaType.Album:
                    // code block
                    def = JSON.parse(JSON.stringify(require('./../defs/def-Album.json')));
                    break;
                case etHelper.ETmediaType.Photo:
                    // code block
                    def = JSON.parse(JSON.stringify(require('./../defs/def-Photo.json')));
                    break;
                case etHelper.ETmediaType.Playlist_Audio:
                    // code block
                    def = JSON.parse(JSON.stringify(require('./../defs/def-Playlist-audio.json')));
                    break;
                case etHelper.ETmediaType.Playlist_Photo:
                    // code block
                    def = JSON.parse(JSON.stringify(require('./../defs/def-Playlist-photo.json')));
                    break;
                case etHelper.ETmediaType.Playlist_Video:
                    // code block
                    def = JSON.parse(JSON.stringify(require('./../defs/def-Playlist-video.json')));
                    break;
                case etHelper.ETmediaType.Libraries:
                    def = JSON.parse(JSON.stringify(require('./../defs/def-LibraryInfo.json')));
                    break;
                case etHelper.ETmediaType.Playlists:
                    def = JSON.parse(JSON.stringify(require('./../defs/def-PlaylistInfo.json')));
                    break;
                default:
                // code block
                log.error(`etHelper (getLevelFields) Unknown libtype: "${this.Settings.libType}" or level: "${this.Settings.level}" in "getLevelFields"`);
            }
            if ( this.Settings.levelName == 'All')
            {
                this.Settings.levelName = 'all';
            }
            if ( this.Settings.selType == this.ETmediaType.Libraries)
            {
                this.Settings.Level = 'all';
            }
            let levels = def[this.Settings.libTypeSec.toString()]['level'][this.Settings.Level];
            if (levels == undefined)
            {
                // We are dealing with a custom level
                levels = wtconfig.get(`ET.CustomLevels.${this.Settings.libTypeSec}.level.${this.Settings.levelName}`);
                log.debug(`etHelper (getLevelFields) Custom level detected as: ${JSON.stringify(levels)}`);
            }
            Object.keys(levels).forEach(function(key) {
                // Skip picture export fields
                if ( !["Export Art", "Export Show Art", "Export Posters", "Export Season Posters", "Export Show Posters"].includes(levels[key]) )
                {
                    out.push(levels[key])
                }
            });
            resolve(out);
        });
    }

    //#region *** Field Header ****

    // Public methode to get the Header
    async getFieldHeader() {
        log.info('etHelper (getFieldHeader) - FieldHeader requested');
        try{
            if (isEmptyObj(this.#_FieldHeader))
            {
                log.verbose(`etHelper(getFieldHeader) - Need to generate the header`);
                this.#_FieldHeader = await etHelper.#SetFieldHeader()
            }
            else
            {
                log.verbose(`etHelper(getFieldHeader) - Returning cached headers`);
            }
        }
        catch (error)
        {
            log.error(`etHelper(getFieldHeader) - ${error}`);
        }
        log.verbose(`etHelper(getFieldHeader) - Field header is: ${JSON.stringify(this.#_FieldHeader)}`);
        return this.#_FieldHeader;
    }

    // Private methode to set the header
    async #SetFieldHeader(){
        log.verbose(`etHelper (SetFieldHeader) - GetFieldHeader level: ${this.Settings.Level} - libType: ${this.Settings.libType}`);
        return await this.getLevelFields();
    }
    //#endregion
}

export { etHelper };