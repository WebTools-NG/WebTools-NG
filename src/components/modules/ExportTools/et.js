/* eslint-disable no-unreachable */
var def = JSON.parse(JSON.stringify(require('./definitions.json')));
const log = require('electron-log');
console.log = log.log;
const defpostURI = '?checkFiles=1&includeRelated=0&includeExtras=1&includeBandwidths=1&includeChapters=1'


import {wtconfig, wtutils} from '../../../wtutils';
import i18n from '../../../i18n';

import filesize from 'filesize';
var path = require("path");

const fetch = require('node-fetch');
//const {jp} = require('jsonpath');

const {JSONPath} = require('jsonpath-plus');
import axios from 'axios'
import store from '../../../store';



const et = new class ET {
    constructor() {
        this.PMSHeader = wtutils.PMSHeader;                
    }

    async getSectionData({sectionName, baseURL, accessToken, libType})
    {
        const sectionData = []
        log.info(`Starting getSectionData with Name: ${sectionName} and with a type of: ${libType}`)    
        // Get Section Key
        const libKey = await et.getSectionKey({libName: sectionName, baseURL: baseURL, accessToken: accessToken})        
        log.debug(`Get SectionKey as: ${libKey}`)
        // Get the size of the library        
        const libSize = await et.getSectionSizeByKey({sectionKey: libKey, baseURL: baseURL, accessToken: accessToken})
        log.debug(`Get Section size as: ${libSize}`)
        // Find LibType steps
        const step = wtconfig.get("PMS.ContainerSize." + libType)
        log.debug(`Get Step size as: ${step}`)
        // Current item
        let idx = 0
        // Now let's walk the section
        let chuncks, postURI 
        const element = '/library/sections/' + libKey
        let size
        do {            
            postURI = `/all?X-Plex-Container-Start=${idx}&X-Plex-Container-Size=${step}`;
            if (libType == 'episode')
            {
                console.log('Ged Episodes needed, so adding the type')
                console.log('Ged url called: ' + baseURL + element + postURI)
                postURI += '&type=4'
            }            
            chuncks = await et.getItemData({baseURL: baseURL, accessToken: accessToken, element: element, postURI: postURI});                        
            size = JSONPath({path: '$.MediaContainer.size', json: chuncks});
            log.verbose(`getSectionData chunck size is ${size} and idx is ${idx}`)                      
            store.commit("UPDATE_EXPORTSTATUS", i18n.t('Modules.ET.Status.GetSectionItems', {idx: idx, chunck: size}))
            sectionData.push(chuncks)             
            idx = idx + step;
        } while (size > 1);        
        return sectionData;        
    }

    async getSectionSizeByKey({sectionKey, baseURL, accessToken})
    {        
        const sizeURI = '/library/sections/' + sectionKey
        const sizePostURI = '/all?X-Plex-Container-Start=0&X-Plex-Container-Size=0'
        const sizeContents = await et.getItemData({baseURL: baseURL, accessToken: accessToken, element: sizeURI, postURI: sizePostURI});       
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
        //log.verbose(`Calling url: ${url}`)        
        let response = await fetch(url, { method: 'GET', headers: this.PMSHeader});    
        let resp = await response.json();          
       return resp
    }

    getRealLevelName(level, libType) {
        // First get the real name of the level, and not just the display name                
        const levelName = def[libType]['levels'][level]        
        return levelName
    }

    async getSections(address, accessToken)
    {
        // Returns an array of json, as:
        // [{"title":"DVR Movies","key":31,"type":"movie"}]
        
        const result = []
        const url = address + '/library/sections/all'        
        this.PMSHeader["X-Plex-Token"] = accessToken;
        let response = await fetch(url, { method: 'GET', headers: this.PMSHeader});    
        let resp = await response.json();
        const respJSON = await Promise.resolve(resp)                 
        let sections = await JSONPath({path: '$..Directory', json: respJSON})[0];        
        for (var section of sections){            
            const subItem = {}
            subItem['title'] = JSONPath({path: '$..title', json: section})[0];                        
            subItem['key'] = parseInt(JSONPath({path: '$..key', json: section})[0]);            
            subItem['type'] = JSONPath({path: '$..type', json: section})[0];                                                                  
            result.push(subItem)
        }        
        await Promise.resolve(result)        
        return  result
    }
    
    getLevelDisplayName(level, libType){
        // return displayname for the buildin levels
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

    getLevelFields(level, libType) {
        // return fields in a level
        const out = []                       
        const levels = def[libType]['level'][et.getRealLevelName(level, libType)]        
        Object.keys(levels).forEach(function(key) {            
            out.push(levels[key])
          });        
        return out
    }

    async getLevelCall (libType, level) {
        // this will return number of calls needed
        const count = await def[libType]['LevelCount'][level]
        log.debug('Count needed is: ' + count)                  
        return count
    }

    getLevels(libType) {
        // Returns an json of levels for a selected type og medias, like 'movie'
        const levels = def[libType]['levels']                       
        log.debug(`ET LevelNames: ${JSON.stringify(levels)}`);
        return levels
    }

    getCustomLevels(libType) {        
        const notDefined = {"No Level Yet": ""}
        // Returns an json of custom levels for a selected type og medias, like 'movie'
        const levels = wtconfig.get(`ET.CustomLevels.${libType}.levels`, notDefined)        
        log.debug('ET LevelNames: ' + JSON.stringify(levels))
        return levels
    }
    
    getLevelKeys(libType){
        // Only return the keys for possible levels
        const out = []
        console.log('GED getLevelKeys LibType:  ' + libType)                 
        const levels = def[libType]['levels']
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
        return def[libType]['fields'][fieldName]        
    }

    getFieldType(libType, fieldName) {
        return def[libType]['fields'][fieldName]['type']        
    }

    getFieldCall(libType, fieldName) {
        return def[libType]['fields'][fieldName]['call']        
    }

    getFieldSubtype(libType, fieldName) {
        return def[libType]['fields'][fieldName]['subtype']        
    }


    getFieldsKeyVal( libType, level) {
        // Get fields for level
        const fields = et.getLevelFields(level, libType)
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
                        log.info("NUGGA: ET : checkServerConnect: response status is 200")
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

    GetHeader(Level, libType) {
        const columns = []
        log.verbose(`AddHeader level: ${Level} - libType: ${libType}`)        
        // Get level fields
        const fields = et.getLevelFields(Level, libType)              
        for (var i=0; i<fields.length; i++) {                        
            log.verbose(`Column: ${fields[i]}`)                                                                        
            columns.push(fields[i])            
        }
        return columns  
    }

    async AddHeader(Sheet, Level, libType) {
        const columns = []
        log.verbose(`AddHeader sheet: ${Sheet} - level: ${Level} - libType: ${libType}`)        
        // Get level fields
        const fields = et.getLevelFields(Level, libType)              
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

    async getFileName({ Library, Level, Type }){
        const dateFormat = require('dateformat');
        const OutDir = wtconfig.get('ET.OutPath', wtutils.UserHomeDir)
        const timeStamp=dateFormat(new Date(), "yyyy.mm.dd_h.MM.ss");          
        return OutDir + '/' + Library + '_' + Level + '_' + timeStamp + '.' + Type;        
    }

    async SaveWorkbook(Workbook, Library, Level, Type) {
        const fs = require('fs')
        const name = await this.getFileName( { Library: Library, Level: Level, Type: Type })
        log.debug('Saving output file as: ' + name)
        // Save Excel on Hard Disk
        Workbook.xlsx.writeBuffer()
            .then(buffer => fs.writeFileSync(name, buffer))
        return true
    }

    async postProcess( {name, val, title=""} ){       
        const valArray = val.split(wtconfig.get('ET.ArraySep', ' - '));
        let retArray = [];
        let x, retVal, start, strStart, end, result;        
        try {                 
            switch ( String(name) ){            
                case "MetaDB Link":                                                                                           
                    for (x=0; x<valArray.length; x++) {                    
                        retArray.push(path.basename(valArray[x].split("?")[0]))                    
                    }
                    retVal = retArray.join(wtconfig.get('ET.ArraySep', ' - '))
                    break;
                case "MetaData Language":                
                    for (x=0; x<valArray.length; x++) {                    
                        retArray.push(path.basename(valArray[x].split("=")[1]))                    
                    }
                    retVal = retArray.join(wtconfig.get('ET.ArraySep', ' - '))
                    break; 
                case "Part File":                
                    for (x=0; x<valArray.length; x++) {                    
                        retArray.push(path.basename(valArray[x]))                    
                    }
                    retVal = retArray.join(wtconfig.get('ET.ArraySep', ' - '))
                    break; 
                case "Part File Path":                
                    for (x=0; x<valArray.length; x++) {                    
                        retArray.push(path.dirname(valArray[x]))                    
                    }
                    retVal = retArray.join(wtconfig.get('ET.ArraySep', ' - '))
                    break;
                case "Part Size": 
                    for (x=0; x<valArray.length; x++) {                    
                        retArray.push(filesize(valArray[x]))                    
                    }
                    retVal = retArray.join(wtconfig.get('ET.ArraySep', ' - '))
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
                        retVal = val;
                    }
                    break;
                case "IMDB":                    
                    start = val.indexOf("imdb://");
                    strStart = val.substring(start);
                    end = strStart.indexOf("-");                    
                    result = ''
                    if (end == -1)
                    { result = strStart.substring(7) }
                    else 
                    { result = strStart.substring(7, end) }
                    if ( result == '')
                    { retVal = wtconfig.get('ET.NotAvail'); }
                    else
                    { retVal = 'https://www.imdb.com/title/' + result; }
                    break;                                                                                                       
                case "TMDB":                    
                    start = val.indexOf("tmdb://");
                    strStart = val.substring(start);
                    end = strStart.indexOf("-");                    
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

    async addRowToTmp( { libType, level, data, stream }) {        
        log.debug(`Start addRowToTmp. libType: ${libType} - level: ${level}`)                                  
        let date, year, month, day, hours, minutes, seconds        
        const fields = et.getFields( libType, level)                       
        let lookup, val, array, i, valArray, valArrayVal, subType, subKey 
        let str = ''
        let result = ''                              
        for (var x=0; x<fields.length; x++) {                                           
            var name = Object.keys(fields[x]);                    
            lookup = JSONPath({path: '$..key', json: fields[x]})[0];                     
            switch(String(JSONPath({path: '$..type', json: fields[x]}))) {
                case "string":                                                                                            
                    val = JSONPath({path: String(lookup), json: data})[0];                    
                    // Make N/A if not found
                    if (val == null)
                    {
                        val = wtconfig.get('ET.NotAvail', 'N/A')
                    }                    
                    break;
                case "array":                                                            
                    array = JSONPath({path: lookup, json: data});
                    valArray = []                                       
                    for (i=0; i<array.length; i++) {                                                                     
                        subType = JSONPath({path: '$..subtype', json: fields[x]});                                                
                        subKey = JSONPath({path: '$..subkey', json: fields[x]});                        
                        switch(String(subType)) {
                            case "string":                                                                                                                       
                                valArrayVal = JSONPath({path: String(subKey), json: array[i]})[0];                                
                                // Make N/A if not found
                                if (valArrayVal == null || valArrayVal == "")
                                {
                                    valArrayVal = wtconfig.get('ET.NotAvail', 'N/A')
                                }
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
                    val = valArray.join(wtconfig.get('ET.ArraySep', ' - '))                                        
                    break;
                case "array-count":                                                                                                                        
                    val = JSONPath({path: String(lookup), json: data}).length;                                                          
                    break;
                case "int":                    
                    val = JSONPath({path: String(lookup), json: data})[0];
                    break;
                case "time":                                                     
                    val = JSONPath({path: String(lookup), json: data});                                                                                                                             
                    if ( typeof val !== 'undefined' && val )
                    {
                        seconds = '0' + (Math.round(val/1000)%60).toString();                            
                        minutes = '0' + (Math.round((val/(1000 * 60))) % 60).toString();                            
                        hours = (Math.trunc(val / (1000 * 60 * 60)) % 24).toString();                                                                  
                        // Will display time in 10:30:23 format                        
                        val = hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);                                           
                    }
                    else
                    {
                        val = null
                    }                                            
                    break;
                case "datetime":                     
                    val = JSONPath({path: String(lookup), json: data});                    
                    if ( typeof val !== 'undefined' && val )
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
                        val = null
                    }                                            
                    break;
                default:
                    log.error(`No Hit addRowToSheet for ${String(JSONPath({path: '$..type', json: fields[x]}))}`)                    
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
            // If string, put in ""
            if (isNaN(val)){
                str += wtconfig.get('ET.ColumnSep') + '"' + val + '"';
            }
            else {
                str += wtconfig.get('ET.ColumnSep') + val;
            }
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

     
    async createXLSXFile( {csvFile, level, libType, libName} )
    {
        // This will loop thru a csv file, and create xlsx file
        // First create a WorkBook
        const workBook = await excel2.NewExcelWorkBook()     
        // Create Sheet
        let sheet = await excel2.NewSheet(workBook, libName, level)        
        // Add the header to the sheet
        await excel2.AddHeader(sheet, level, libType)
        
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
        lineReader.on('line', async function (line) {                                    
        // Skip first line
        if (lineno != 0){
            var lineArr = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);                           
            await sheet.addRow(lineArr)
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
            await excel2.SaveWorkbook(workBook, libName, level, "xlsx")            
        });
    }

    async createOutFile( {libName, level, libType, baseURL, accessToken} )
    {        
        const header = excel2.GetHeader(level, libType)
        log.debug(`header: ${header}`);
        const strHeader = header.join(wtconfig.get('ET.ColumnSep', ','))
        // Now we need to find out how many calls to make
        const call = await et.getLevelCall(libType, level)                                        
        // Open a file stream
        const tmpFile = await excel2.getFileName({ Library: libName, Level: level, Type: 'tmp' })
        var fs = require('fs');        
        var stream = fs.createWriteStream(tmpFile, {flags:'a'});
        // Add the header
        stream.write( strHeader + "\n");
        // Get all the items in small chuncks        
        var sectionData = await et.getSectionData({sectionName: libName, baseURL: baseURL, accessToken: accessToken, libType: libType})                                 
        log.verbose(`Amount of chunks in sectionData are: ${sectionData.length}`)                          
        let item
        for (var x=0; x<sectionData.length; x++)                
        {
            store.commit("UPDATE_EXPORTSTATUS", i18n.t('Modules.ET.Status.Processing-Chunk', {current: x, total: sectionData.length}))                    
            var sectionChunk = await JSONPath({path: "$.MediaContainer.Metadata[*]", json: sectionData[x]});        
            if ( call == 1 )
            {                
                for (item of sectionChunk){                                                      
                    await excel2.addRowToTmp( { libType: libType, level: level, data: item, stream: stream } );
                }
            }             
            else
            {                           
                // Get ratingKeys in the chunk
                const urls = await JSONPath({path: '$..ratingKey', json: sectionChunk});
                let urlStr = urls.join(','); 
                log.verbose(`Items to lookup are: ${urlStr}`)
                store.commit("UPDATE_EXPORTSTATUS", i18n.t('Modules.ET.Status.Processing-Chunk-Detailed', {current: x, total: sectionData.length, urlStr: urlStr}))                
                const urlWIthPath = '/library/metadata/' + urlStr                          
                log.verbose(`Items retrieved`);
                const contents = await et.getItemData({baseURL: baseURL, accessToken: accessToken, element: urlWIthPath});
                const contentsItems = await JSONPath({path: '$.MediaContainer.Metadata[*]', json: contents});                                                
                for (item of contentsItems){                       
                    await excel2.addRowToTmp( { libType: libType, level: level, data: item, stream: stream } );
                }
            }                                            
        } 
        stream.end();  
        // Rename to real file name
        var newFile = tmpFile.replace('.tmp', '.csv')  
        fs.renameSync(tmpFile, newFile);                      
        console.log('renamed complete');        
        // Need to export to xlsx as well?
        if (wtconfig.get('ET.ExpExcel')){            
            log.info('We need to create an xlsx file as well')
            await excel2.createXLSXFile( {csvFile: newFile, level: level, libType: libType, libName: libName})
        }
        store.commit("UPDATE_EXPORTSTATUS", `Export finished. File:"${newFile}" created`);
    }       
}

export {et, excel2};