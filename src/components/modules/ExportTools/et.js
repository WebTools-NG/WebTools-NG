var def = JSON.parse(JSON.stringify(require('./definitions.json')));
const log = require('electron-log');
import {wtconfig, wtutils} from '../../../wtutils'
import axios from 'axios'

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
        // this will return true, if we also need to call individual items
        console.log('Ged libType: ' + libType)
        console.log('Ged Level: ' + level)
        return true
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

    checkServerConnect(server) {
        log.info("NUGGA : ET : checkServerConnect called")
        server.connections.forEach((val) => {
            log.info(val.uri)
            let baseurl = val.uri

                axios.get(baseurl + '/identity')
                .then(response => {
                    log.info(response)
                  }).catch(error => {
                      log.error(error)
                  })
            }
          )
       let serverAdress = []

        return serverAdress
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
        let key
        // Get level fields
        const fields = et.getLevelFields(Level, libType)        
        for (var i=0; i<fields.length; i++) {
            key = et.getFieldKey(libType, fields[i])
            log.debug('Column: ' + fields[i] + ' - ' + key)                                                
            //let column = { header: Level[i], key: 'id', width: 10 }
            let column = { header: fields[i], key: key }
            columns.push(column)            
        }             
        Sheet.columns = columns
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
}

export {et, excel};