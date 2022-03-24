// This file holds generic et functions
import {ipcRenderer} from 'electron';
import { wtconfig, wtutils } from '../../General/wtutils';
import store from '../../../../store';
import {csv} from './csv';
import {et} from './et';
import i18n from '../../../../i18n';
import filesize from 'filesize';
import Excel from 'exceljs';

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
    log.debug(`etHelper (setQualifier) - Got: _WTNG_${str}_WTNG_ and returning ${result}`);
    return result;
}

// Clean up tmpFileName for suggested files/folders
// Remove leading and trailing spaces, as well as special characters
function cleanupSuggestedFile( tmpFileName )
{
    const unWantedChars = '.-*_[](){}';
    log.verbose(`etHelper (cleanupSuggestedFile) - starting Param: ${tmpFileName}`);   
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
    log.verbose(`etHelper (cleanupSuggestedFile) - Returning: ${tmpFileName}`); 
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
    log.verbose(`etHelper (getSuggestedId) - Started. To see Param, switch to Silly logging`);    
    log.silly(`etHelper (getSuggestedId) - Starting with param: ${JSON.stringify(data)}`);   
    let imdb = String(JSONPath({path: "$.data.Guid[?(@.id.startsWith('imdb'))].id", json: data}));
    let tmdb = String(JSONPath({path: "$.data.Guid[?(@.id.startsWith('tmdb'))].id", json: data}));
    let tvdb = String(JSONPath({path: "$.data.Guid[?(@.id.startsWith('tvdb'))].id", json: data}));
    if (imdb === ''){
        imdb = "imdb://" + String(JSONPath({path: "$.data.guid", json: data})).substring(26,).split('?')[0];
    }
    // Fallback to imdb, if tmdb is not present
    if (tmdb === '')
    {
        tmdb = imdb;
    }
    // Fallback to imdb, if tvdb is not present
    if (tvdb === '')
    {
        tvdb = imdb;
    }
    let selId;        
    if ( etHelper.Settings.libType === 1)
    {
        selId = wtconfig.get("ET.SelectedMoviesID", "imdb");
    }
    else
    {
        selId = wtconfig.get("ET.SelectedShowsID", "tmdb");
    }
    log.silly(`etHelper (getSuggestedId) - imdb ID: ${imdb}`);   
    log.silly(`etHelper (getSuggestedId) - tmdb ID: ${tmdb}`);   
    log.silly(`etHelper (getSuggestedId) - tvdb ID: ${tvdb}`);   

    let Id;
    switch(selId) {
        case 'imdb':
            Id = `{imdb-${imdb.slice(7)}}`;
            break;
        case 'tmdb':
            if (tmdb === '')
            {
                Id = `{imdb-${imdb.slice(7)}}`;
            }
            else
            {
                Id = `{tmdb-${tmdb.slice(7)}}`;
            }
            break;
        case 'tvdb':
            if (tvdb === '')
            {
                Id = `{imdb-${imdb.slice(7)}}`;
            }
            else
            {
                Id = `{tvdb-${tvdb.slice(7)}}`;
            }
            break;    
    }
    log.debug(`etHelper (getSuggestedId) - Returning: "imdb": ${imdb}, "tmdb": ${tmdb}, "tvdb": ${tvdb}, "selId": ${Id}`);   
    return {"imdb": imdb, "tmdb": tmdb, "tvdb": tvdb, "selId": Id};
}

// Returns a string stripped for Year
function stripYearFromFileName( tmpFileName, year ){
    const re = new RegExp(`\\b${year}\\b`, 'gi');
    return tmpFileName.replace(re, "").trim();    
}

// Returns a string stripped for ID's
function stripIdFromFileName( param ){    
    log.debug(`etHelper (stripIdFromFileName) - starting function with param as: ${JSON.stringify(param)}`);
    let tmpFileName = param.tmpFileName;
    let re;
    const imdb = param.imdb.slice(7);
    const tmdb = param.tmdb.slice(7);
    const tvdb = param.tvdb.slice(7);
    // Remove IMDB id    
    log.debug(`etHelper (stripIdFromFileName) - Imdb string is : ${imdb}`);
    re = new RegExp(`\\b${imdb}\\b`, 'gi');
    tmpFileName = tmpFileName.replace(re, "");
    log.debug(`etHelper (stripIdFromFileName) - After imdb id is removed: ${tmpFileName}`);
    tmpFileName = tmpFileName.replace(/imdb-/i, '');
    log.debug(`etHelper (stripIdFromFileName) - After imdb string is removed: ${tmpFileName}`);
    // Remove TMDB id    
    re = new RegExp(`\\b${tmdb}\\b`, 'gi');
    tmpFileName = tmpFileName.replace(re, "");
    // Remove TVDB id    
    re = new RegExp(`\\b${tvdb}\\b`, 'gi');
    tmpFileName = tmpFileName.replace(re, "");
    const idProviders = ['imdb', 'tmdb', 'tvdb'];    
    idProviders.forEach(element => {
        re = new RegExp(`\\b${element}\\b`, 'gi');
        tmpFileName = tmpFileName.replace(re, "");        
    });
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
    log.verbose(`etHelper (stripPartsFromFileName) - looking at ${tmpFileName}`);
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
                log.info(`etHelper (stripPartsFromFileName) - for the media with the title: "${title}" looking at the string: "${tmpFileName}" for stacked element: "${element}" but found next character not a number so ignorring`)
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
                    log.warn(`etHelper (stripPartsFromFileName) - for the media with the title: "${title}" looking at the string: "${tmpFileName}" for stacked element: "${element}" but found entry not in range [1-8] so ignorring`)
                    log.warn(`etHelper (stripPartsFromFileName) - See: https://support.plex.tv/articles/naming-and-organizing-your-movie-media-files/`)
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
    log.verbose(`etHelper (stripPartsFromFileName) - Returning tmpFileName as: ${tmpFileName} *** Returning partName as: ${partName}`);
    return {        
        fileName: tmpFileName,
        partName: partName
    };
}

//#endregion

const etHelper = new class ETHELPER {
    // Private Fields
    #_FieldHeader = [];
    #_StartTime = null;
    #_EndTime = null;
    #_statusmsg = {};
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
            totalItems: null,
            startItem: 0,
            endItem: null,
            count: 0,
            selType: null,
            fileMajor: null,
            fileMinor: null,
            element: null,
            SelectedMoviesID: null,
            SelectedShowsID: wtconfig.get("ET.SelectedShowsID", "tmdb")
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
        this.RawMsgType = {
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
        this.StackedFilesName = ['cd', 'disc', 'dvd', 'part', 'pt'];
    }

    resetETHelper() {
        this.#_FieldHeader = [];
        this.Settings.Level = null;
        this.Settings.libType = null;
//        this.Settings.libTypeSec = null;
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
        log.verbose(`etHelper (getSuggestedFolderName) - Starting function. To see param, use Silly log level`);
        log.silly(`etHelper (getSuggestedFolderName) - Data pased over as: ${JSON.stringify(data)}`);
        const title = getSuggestedTitle( data );
        const year = getSuggestedYear( data );  
        const Id = getSuggestedId( data ).selId;     
        // Get current folder name  
        const curFolderName = path.basename(path.dirname(String(JSONPath({path: "$.data.Media[0].Part[0].file", json: data}))))   
        // Compute suggested foldername
        let foldername = `${title} (${year}) ${Id}`;
        log.debug(`etHelper (getSuggestedFolderName) - Suggested folderName is: ${foldername}`);
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

        //cleanupSuggestedFile(tmpFileName);

        /*
        // Remove empty brackets if present
        tmpFileName = tmpFileName.replaceAll("()", "");
        // Remove empty curly brackets if present
        tmpFileName = tmpFileName.replaceAll("{}", "");
        // Now replace square brackets if present with a dot
        tmpFileName = tmpFileName.replaceAll("[", ".");
        tmpFileName = tmpFileName.replaceAll("]", ".");        
        // Remove double dots if present
        tmpFileName = tmpFileName.replaceAll("..", ".");
        tmpFileName = tmpFileName.trim();
        // Remove leading dots if present
        while(tmpFileName.charAt(0) === '.')
        {
            tmpFileName = tmpFileName.substring(1);
        }        
        // Remove trailing dots if present        
        while(tmpFileName.slice(-1) === '.')
        {
            tmpFileName = tmpFileName.substring(0, tmpFileName.length - 1);
        }     
        // Remove double square brackets if present
        tmpFileName = tmpFileName.replaceAll("[]", "");
        // Remove double square brackets with a space if present
        tmpFileName = tmpFileName.replaceAll("[ ]", "");
        // Remove double space if present
        tmpFileName = tmpFileName.replaceAll("  ", " ");
        // Remove space dot if present, and replace with dot
        tmpFileName = tmpFileName.replaceAll(" .", ".");
        


               
        tmpFileName = tmpFileName.trim();   
        
         */
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
        log.debug(`etHelper (getSuggestedFileName) - returning ${suggestedFileName}`);
        if (curFileName === path.parse(suggestedFileName).name) {
            return i18n.t("Modules.ET.FileNameOK")            
          }
        else {            
            return suggestedFileName
        }        
    }

    async postProcess( {name, val, title="", data} ){
        log.debug(`ETHelper(postProcess) - Val is: ${JSON.stringify(val)}`);
        log.debug(`ETHelper(postProcess) - name is: ${name}`);
        log.debug(`ETHelper(postProcess) - title is: ${title}`);
        let retArray = [];
        let guidArr;
        let x, retVal, start, strStart, end, result;
        try {
            const valArray = val.split(wtconfig.get('ET.ArraySep', ' * '));
            switch ( String(name) ){
                case "Audience Rating":
                    {
                        retVal = val.substring(0, 3);
                        break;
                    }
                case "Rating":
                    {
                        retVal = val.substring(0, 3);
                        break;
                    }
                case "Suggested File Name":
                    retVal = await this.getSuggestedFileName( {data: data} );                        
                    break;
                case "Suggested Folder Name":
                    retVal = await this.getSuggestedFolderName( {data: data} );                        
                    break;                    
                case "Part File":
                    for (x=0; x<valArray.length; x++) {
                        retArray.push(path.basename(valArray[x]).slice(0, -1));
                    }
                    retVal = retArray.join(wtconfig.get('ET.ArraySep', ' * '))
                    break;
                case "Part File Path":
                    for (x=0; x<valArray.length; x++) {
                        retArray.push(path.dirname(valArray[x]).substring(1));
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
                        log.debug(`We need to override Original Titel, if not avail`);
                        log.debug(`Got Original title as: ${val}`);
                        log.debug(`Alternative might be title as: ${title}`);
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
                    log.debug(`Original Title returned as: ${retVal}`)
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
                            retVal = result = 'https://www.themoviedb.org/movie/' + item.substring(7);
                        }
                    }
                    break;
                default:
                    log.error(`postProcess no hit for: ${name}`)
                    break;
            }
        } catch (error) {
            retVal = 'ERROR'
            log.error(`ETHelper(postProcess) - We had an error as: ${error} . So postProcess retVal set to ERROR`);
        }
        return await retVal;
    }

    async addRowToTmp( { data }) {
        this.Settings.currentItem +=1;
        this.updateStatusMsg(this.RawMsgType.Items, i18n.t('Modules.ET.Status.ProcessItem', {count: this.Settings.count, total: this.Settings.endItem}));
        log.debug(`Start addRowToTmp item ${this.Settings.currentItem} (Switch to Silly log to see contents)`)
        log.debug(`Data is: ${JSON.stringify(data)}`)
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
                this.updateStatusMsg(this.RawMsgType.Items, i18n.t('Modules.ET.Status.ProcessItem', {count: this.Settings.count, total: this.Settings.endItem}));
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
//                        val = setQualifier( {str: val} );
                        break;
                    case "array":
                        array = JSONPath({path: key, json: data});
                        if (array === undefined || array.length == 0) {
//                            val = setQualifier( {str: wtconfig.get('ET.NotAvail', 'N/A')} );
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
//                            val = setQualifier( {str: val} );
                        }
                        break;
                    case "array-count":
                        val = JSONPath({path: String(key), json: data}).length;
                        break;
                    case "int":
                        val = JSONPath({path: String(key), json: data})[0];
                        break;
                    case "time":
                        //val = JSONPath({path: String(lookup), json: data});
                        val = JSONPath({path: key, json: data});
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
//                        val = setQualifier( {str: val} );
                        break;
                    case "datetime":
                        //val = JSONPath({path: String(lookup), json: data});
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
//                        val = setQualifier( {str: val} );
                        break;
                }
                if ( doPostProc )
                {
                    const title = JSONPath({path: String('$.title'), json: data})[0];
                    log.debug(`ETHelper(addRowToTmp doPostProc) - Name is: ${name} - Title is: ${title} - Val is: ${val}`)
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
            log.error(`We had an exception in ethelper addRowToTmp as ${error}`);
            log.error(`Fields are name: ${name}, key: ${key}, type: ${type}, subType: ${subType}, subKey: ${subKey}`);
        }
        // Remove last internal separator
        str = str.substring(0,str.length-etHelper.intSep.length);
        str = str.replaceAll(this.intSep, wtconfig.get("ET.ColumnSep", '|'));
        this.updateStatusMsg( this.RawMsgType.TimeElapsed, await this.getRunningTimeElapsed());
        log.debug(`etHelper (addRowToTmp) returned: ${JSON.stringify(str)}`);
        return str;
    }

    async getItemDetails( { key })
    {
        const url = this.Settings.baseURL + key + '?' + this.getIncludeInfo();
        this.PMSHeader["X-Plex-Token"] = this.Settings.accessToken;
        log.verbose(`Calling url in getItemDetails: ${url}`)
        let response = await fetch(url, { method: 'GET', headers: this.PMSHeader});
        let resp = await response.json();
        resp = JSONPath({path: '$.MediaContainer.Metadata.*', json: resp})[0];
        log.debug(`Response in getItemDetails: ${JSON.stringify(resp)}`);
        return resp
    }

    async forceDownload( { url: url, target: target, title: title } ) {
        const _this = this;
        return new Promise((resolve) => {
            try
            {
                _this.isDownloading = true;
                ipcRenderer.send('downloadFile', {
                    item: url,
                    filePath: target
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
        log.info('etHelper(populateExpFiles) - Populating export files');
        // Current item counter in the chunck
        //let idx = 0;
        let idx = this.Settings.startItem;
        this.Settings.count = idx;
        // Get status for exporting arts and posters
        const bExportPosters = wtconfig.get(`ET.CustomLevels.${this.Settings.libTypeSec}.Posters.${this.Settings.levelName}`, false);
        const bExportArt = wtconfig.get(`ET.CustomLevels.${this.Settings.libTypeSec}.Art.${this.Settings.levelName}`, false);
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
                    await this.exportPics( { type: 'arts', data: chunckItems[item] } )
                }
                ++this.Settings.count;
                if ( this.Settings.count >= this.Settings.endItem) {
                    break;
                }
            }
            idx = Number(idx) + Number(step);
        } while (this.Settings.count < this.Settings.endItem);
        log.info('etHelper(populateExpFiles) - Populating export files ended');
    }

    async getSectionSize()
    {
        log.debug(`etHelper (getSectionSize) - selType: ${this.Settings.selType}`)
        log.debug(`etHelper (getSectionSize) - libTypeSec: ${this.Settings.libTypeSec}`)
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
        log.verbose(`Calling url in getSectionSize: ${url}`)
        let response = await fetch(url, { method: 'GET', headers: this.PMSHeader});
        let resp = await response.json();
        var totalSize = JSONPath({path: '$..totalSize', json: resp})[0];
        log.debug(`Response in getSectionSize: ${totalSize}`);
        return totalSize;
    }

    async getSectionData()
    {
        log.debug(`etHelper (getSectionData) - Element is: ${this.Settings.element}`)
        //const url = this.Settings.baseURL + this.Settings.element + '?' + this.getPostURI() + this.Settings.count;
        const url = this.Settings.baseURL + this.Settings.element + this.getPostURI() + this.Settings.count;
        this.PMSHeader["X-Plex-Token"] = this.Settings.accessToken;
        log.verbose(`etHelper (getSectionData) - Calling url in getSectionData: ${url}`)
        let response = await fetch(url, { method: 'GET', headers: this.PMSHeader});
        let resp = await response.json();
        log.debug(`etHelper (getSectionData) - Response in getSectionData: ${JSON.stringify(resp)}`)
        return resp
    }

    async getLevelCall () {
        if (this.Settings.libType == this.ETmediaType.Playlist)
        {
            this.Settings.libType = this.Settings.libTypeSec;
        }
        log.debug(`etHelper (getLevelCall) - LibType: ${this.Settings.libTypeSec} * LevelName: ${this.Settings.levelName}`);
        let count = await defLevels[this.Settings.libTypeSec]['LevelCount'][this.Settings.levelName]
        if (count == undefined)
        {
            // We are dealing with a custom level
            log.debug('Count requested for a custom level')
            count = wtconfig.get(`ET.CustomLevels.${this.Settings.libTypeSec}.LevelCount.${this.Settings.levelName}`);
        }
        log.info('Count needed is: ' + count)
        return count
    }

    async exportMedias() {
        this.updateStatusMsg( this.RawMsgType.Status, i18n.t("Modules.ET.Status.Running"));
        this.updateStatusMsg( this.RawMsgType.StartTime, await this.getNowTime('start'));
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
        this.clearStatus();
        this.updateStatusMsg( this.RawMsgType.Status, i18n.t("Modules.ET.Status.Finished"));
        this.updateStatusMsg( this.RawMsgType.StartTime, await this.getStartEndTime('start'));
        this.getNowTime('end');
        this.updateStatusMsg( this.RawMsgType.EndTime, await this.getStartEndTime('end'));
        this.updateStatusMsg( this.RawMsgType.TimeElapsed, await this.getTimeElapsed());
        this.updateStatusMsg( this.RawMsgType.OutFile, this.Settings.outFile);
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

    async exportPics( { type: extype, data: data} ) {
        let ExpDir, picUrl, resolutions;
        log.verbose(`Going to export ${extype}`);
        try
        {
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
        }
        catch (error)
        {
            log.error(`Exception in exportPics is: ${error}`);
        }
        log.verbose(`picUrl is: ${picUrl}`);
        log.verbose(`resolutions is: ${JSON.stringify(resolutions)}`);
        log.verbose(`ExpDir is: ${ExpDir}`);
        // Create export dir
        var fs = require('fs');
        if (!fs.existsSync(ExpDir)){
            fs.mkdirSync(ExpDir);
        }
        let key = String(JSONPath({path: '$.ratingKey', json: data})[0]);
        let title = String(JSONPath({path: '$.title', json: data})[0]);
        // Get resolutions to export as
        for(let res of resolutions) {
            const fileName = key + '_' + title.replace(/[/\\?%*:|"<>]/g, ' ').trim() + '_' + res.trim().replace("*", "x") + '.jpg';
            let outFile = path.join(
                ExpDir,
                fileName
                );
            // Build up pic url
            const width = res.split('*')[1].trim();
            const hight = res.split('*')[0].trim();
            let URL = this.Settings.baseURL + '/photo/:/transcode?width=';
            URL += width + '&height=' + hight;
            URL += '&minSize=1&url=';
            URL += picUrl;
            log.verbose(`Url for ${extype} is ${URL}`);
            log.verbose(`Outfile is ${outFile}`);
            URL += '&X-Plex-Token=' + this.Settings.accessToken;
            await this.forceDownload( { url:URL, target:outFile, title:title} );
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
            log.error(`etHelper: Exception happened when creating xlsx stream as: ${error}`);
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
        arrFile.push('Item ' + this.Settings.startItem + '-' + this.Settings.endItem);
        arrFile.push(timeStamp + '.' + Type + '.tmp');
        this.Settings.outFile = arrFile.join('_');
        // Remove unwanted chars from outfile name
        const targetDir = path.join(
            OutDir, wtutils.AppName, i18n.t('Modules.ET.Name'));
        const outFileWithPath = path.join(
            targetDir, this.Settings.outFile);
        // Make sure target dir exists
        const fs = require('fs')
        if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir);
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
        log.debug(`etHelper (getIncludeInfo) - Started. libTypeSec is: ${this.Settings.libTypeSec} and levelName is: ${this.Settings.levelName}`);  
        try {
            includeInfo = defLevels[this.Settings.libTypeSec]['Include'][this.Settings.levelName];
        }
        catch (error) {
            includeInfo = ''
        }
        if (includeInfo == 'undefined')
        {
            includeInfo = ''
        }
        if (includeInfo == null)
        {
            includeInfo = ''
        }
        log.debug(`etHelper (getInclude) - returning: ${includeInfo}`);
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
                if ( !["Export Art", "Export Posters"].includes(levels[key]) )
                {
                    out.push(levels[key])
                }
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

    //#region *** Time ***
    async getTimeElapsed(){
        let elapsedSeconds = Math.floor((this.#_EndTime.getTime() - this.#_StartTime.getTime()) / 1000);
        let elapsedStr = elapsedSeconds.toString().replaceAll('.', '');
        let hours = Math.floor(parseFloat(elapsedStr) / 3600);
        elapsedSeconds = parseFloat(elapsedStr) - hours * 3600;
        let minutes = Math.floor(elapsedSeconds / 60);
        let seconds = elapsedSeconds - minutes * 60;
        if ( hours.toString().length < 2) { hours = '0' + hours}
        if ( minutes.toString().length < 2) { minutes = '0' + minutes}
        if ( seconds.toString().length < 2) { seconds = '0' + seconds}
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
        if ( hours.toString().length < 2) { hours = '0' + hours}
        if ( minutes.toString().length < 2) { minutes = '0' + minutes}
        if ( seconds.toString().length < 2) { seconds = '0' + seconds}
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
        let hours = Math.floor(parseFloat(elapsedStr) / 3600);
        elapsedSeconds = parseFloat(elapsedStr) - hours * 3600;
        let minutes = Math.floor(elapsedSeconds / 60);
        let seconds = elapsedSeconds - minutes * 60;
        if ( hours.toString().length < 2) { hours = '0' + hours}
        if ( minutes.toString().length < 2) { minutes = '0' + minutes}
        if ( seconds.toString().length < 2) { seconds = '0' + seconds}
        return hours + ':' + minutes + ':' + seconds
    }
    //#endregion
}

export { etHelper };