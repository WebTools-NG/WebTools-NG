var def = JSON.parse(JSON.stringify(require('./definitions.json')));
const log = require('electron-log');
import {wtconfig, wtutils} from '../../../wtutils'
const fetch = require('node-fetch');
const jp = require('jsonpath')

/* async function getSectionNameAndSize(baseURI, accessToken, sectionID)
{
    const url = baseURI + '/library/sections/' + sectionID + '/all?X-Plex-Container-Start=0&X-Plex-Container-Size=0'    
    var headers = {
        "Accept": "application/json",
        "X-Plex-Token": accessToken
      }
    const result = {}
    let response = await fetch(url, { method: 'GET', headers: headers});    
    let resp = await response.json();
    const respJSON = await Promise.resolve(resp)    
    result['size'] = jp.value(respJSON, '$.MediaContainer.totalSize');
    result['name'] = jp.value(respJSON, '$.MediaContainer.librarySectionTitle');
    console.log('GED RESULT: ' + JSON.stringify(result))
    return result    
} */

const et = new class ET {
    constructor() {                    
    }

    getRealLevelName(level, libType) {
        // First get the real name of the level, and not just the display name
        const levelName = def[libType]['levels'][level]
        log.debug('ET LevelName: ' + levelName)
        return levelName
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

    getLevelCall (libType, level) {
        // this will return number of calls needed
        let count = 0
        // So walk every field
        const fields = et.getLevelFields(level, libType)
        for (var i=0; i<fields.length; i++) {
            const call = def[libType]['fields'][fields[i]]['call']
            if (call > count)
            {
                count = call
            }
        }
        log.debug('Count needed is: ' + count)        
        return count
    }

    getLevels(libType) {
        // Returns an array of levels for a selected type og medias, like 'movie'
        const levels = def[libType]['levels']
        log.debug('ET LevelNames: ' + JSON.stringify(levels))
        return levels
    }

    getLevelKeys(libType){
        // Only return the keys for possible levels
        const out = []
        const levels = def[libType]['levels']
        Object.keys(levels).forEach(function(key) {            
            out.push(key)
          });        
        return out        
    }

    getFieldKey(libType, fieldName) {
        return def[libType]['fields'][fieldName]['key']        
    }

    getFieldType(libType, fieldName) {
        return def[libType]['fields'][fieldName]['type']        
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

    async getSectionNameSize(baseURI, accessToken, sectionID) {
        //getSectionNameAndSize(baseURI, accessToken, sectionID)
        const url = baseURI + '/library/sections/' + sectionID + '/all?X-Plex-Container-Start=0&X-Plex-Container-Size=0'    
        var headers = {
            "Accept": "application/json",
            "X-Plex-Token": accessToken
        }
        const result = {}
        let response = await fetch(url, { method: 'GET', headers: headers});    
        let resp = await response.json();
        const respJSON = await Promise.resolve(resp)    
        result['size'] = jp.value(respJSON, '$.MediaContainer.totalSize');
        result['name'] = jp.value(respJSON, '$.MediaContainer.librarySectionTitle');
        console.log('GED RESULT: ' + JSON.stringify(result))
        return result  
    }
}

const excel = new class Excel {
    constructor() {           
    }    
    NewSheet(Workbook, Library, Level) {        
        const sheet = Workbook.addWorksheet(Library + '-' + Level, {
            views: [
            {state: 'frozen', ySplit: 1}
            ]
            });        
        return sheet
    }

    AddHeader(Sheet, Level, libType) {
        const columns = []
        //let key
        // Get level fields
        const fields = et.getLevelFields(Level, libType)        
        for (var i=0; i<fields.length; i++) {                        
            //log.debug('Column: ' + fields[i] + ' - ' + fields[i])                                                
            //let column = { header: Level[i], key: 'id', width: 10 }
            let column = { header: fields[i], key: fields[i] }
            columns.push(column)            
        }             
        Sheet.columns = columns
        // Add background to header column
        Sheet.getRow(1).fill = {
            type: 'pattern',
            pattern:'solid',
            fgColor:{ argb:'729fcf' }
            }

/*         Sheet.autoFilter = {
            from: 'A1',
            to: 'D1',
          } */
    }

    AddRow(Sheet, Row) {
        // Adds a row to the Sheet
        // Find last Row
        Sheet.addRow(Row);
    }
    
    SaveWorkbook(Workbook, Library, Level, Type) {
        const fs = require('fs')
        const dateFormat = require('dateformat');
        const OutDir = wtconfig.get('ET.OutPath', wtutils.UserHomeDir)
        const timeStamp=dateFormat(new Date(), "yyyy.mm.dd_h.MM.ss");          
        const name = OutDir + '/' + Library + '_' + Level + '_' + timeStamp + '.' + Type;
        log.debug('Saving output file as: ' + name)
        // Save Excel on Hard Disk
        Workbook.xlsx.writeBuffer()
            .then(buffer => fs.writeFileSync(name, buffer))
    }

    NewExcelFile() {
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

    addToSheet(sheet, libType, level, data) {
        console.log('Start AddToSheet')           
        // Placeholder for row
        let row = []
        let date, year, month, day, hours, minutes, seconds
        // Need to find the fields and keys we'll
        // query the data for
        const keyVal = et.getFieldsKeyValType( libType, level)               
        // Now get the medias                
        const nodes = jp.nodes(data, '$.MediaContainer.Metadata[*]')         
        for (var x=0; x<nodes.length; x++) {
            const mediaItem = nodes[x].value
            const rowentry = {}            
            for (var i=0; i<keyVal.length; i++) {                                
                const monthsArr = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
                // Get type
                let val                
                switch(Object.values(keyVal[i])[0][1]) {
                    case "string":
                        val = jp.value(mediaItem, Object.values(keyVal[i])[0][0]);
                        break;
                    case "array":
                        // Get Items                        
                        val = jp.query(mediaItem, Object.values(keyVal[i])[0][0]);
                        // Seperate as wanted
                        val = val.join(wtconfig.get('ET.ArraySep', ' - '))                        
                        break;
                    case "int":
                        val = '';
                        break;
                    case "time":
                        val = jp.value(mediaItem, Object.values(keyVal[i])[0][0]);                                                
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
                        val = jp.value(mediaItem, Object.values(keyVal[i])[0][0]);                                                
                        if ( typeof val !== 'undefined' && val )
                        {
                            // Create a new JavaScript Date object based on the timestamp
                            // multiplied by 1000 so that the argument is in milliseconds, not seconds.
                            date = new Date(val * 1000);                            
                            year = date.getFullYear();                            
                            month = monthsArr[date.getMonth()];                            
                            day = date.getDate();                            
                            hours = date.getHours();                            
                            minutes = "0" + date.getMinutes();                            
                            seconds = "0" + date.getSeconds();
                            // Will display time in 10:30:23 format                        
                            val = month+'-'+day+'-'+year+' '+hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
                        }
                        else
                        {
                            val = null
                        }                                            
                        break;            
                }

                //console.log('Ged Value: ' + val)
           
                if (val == null)
                {
                    val = wtconfig.get('ET.NotAvail', 'N/A')
                }
                //console.log('Media Item: ' + Object.keys(keyVal[i]) + ' has a value of: ' + val)
                rowentry[Object.keys(keyVal[i])] = val
            }
            row.push(rowentry)
        }
        //console.log('Entire rows: ' + JSON.stringify(row))
        row.forEach(element => {
            excel.AddRow(sheet, element)            
        });                     
    }        
    
    exportMedia(baseURI, accessToken, level, sectionID) {
        console.log('GED exportMedia Start');
        console.log('GED exportMedia baseURI: ' + baseURI);
        // Get section name and size
        let result
        //var ged = et.getSectionNameSize(baseURI, accessToken, sectionID)
        et.getSectionNameSize(baseURI, accessToken, sectionID)
            .then(function(values) {
                console.log('GED Result returned: ' + JSON.stringify(values));
                result = values
              }).catch(function(error) {
                console.error(error);
              });
       
                
        console.log('GED Result Outside returned: ' + JSON.stringify(result))
        level        
    }
}

export {et, excel};