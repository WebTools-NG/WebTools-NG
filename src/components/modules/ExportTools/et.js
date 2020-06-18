var def = JSON.parse(JSON.stringify(require('./definitions.json')));
const log = require('electron-log');
import {wtconfig, wtutils} from '../../../wtutils'



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
            //key = et.getFieldKey(libType, fields[i])
            //log.debug('Column: ' + fields[i] + ' - ' + key)                                                
            log.debug('Column: ' + fields[i] + ' - ' + fields[i])                                                
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
        const jp = require('jsonpath')
        // Placeholder for row
        let row = []
        // Need to find the fields and keys we'll
        // query the data for
        const keyVal = et.getFieldsKeyVal( libType, level)
        // Now get the medias                
        const nodes = jp.nodes(data, '$.MediaContainer.Metadata[*]')         
        for (var x=0; x<nodes.length; x++) {
            const mediaItem = nodes[x].value
            const rowentry = {}            
            for (var i=0; i<keyVal.length; i++) {
                let val = jp.value(mediaItem, Object.values(keyVal[i]))                
                if (val == null)
                {
                    val = wtconfig.get('ET.NotAvail', 'N/A')
                }
                console.log('Media Item: ' + Object.keys(keyVal[i]) + ' has a value of: ' + val)
                rowentry[Object.keys(keyVal[i])] = val
            }
            row.push(rowentry)
        }
        console.log('Entire rows: ' + JSON.stringify(row))
        row.forEach(element => {
            excel.AddRow(sheet, element)            
        });                     
    }
}

export {et, excel};