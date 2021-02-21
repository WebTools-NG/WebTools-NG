// Helper file for PMS Settings module
const log = require('electron-log');
console.log = log.log;



import {wtconfig, wtutils} from '../../../General/wtutils';

import i18n from '../../../../../i18n';
import store from '../../../../../store';

i18n, wtconfig, wtutils, store


const pmssettings = new class PMSSettings {
    constructor() {
        this.header = [
            i18n.t('Modules.PMS.Export.Items.Category'),
            i18n.t('Modules.PMS.Export.Items.Name'),
            i18n.t('Modules.PMS.Export.Items.Label'),
            i18n.t('Modules.PMS.Export.Items.Summary'),
            i18n.t('Modules.PMS.Export.Items.Type'),
            i18n.t('Modules.PMS.Export.Items.Default'),
            i18n.t('Modules.PMS.Export.Items.Value')
        ]
        this.itemfields = [                        
            "label",
            "summary",
            "type",
            "default",
            "value"
        ],
        this.separator = wtconfig.get('ET.ColumnSep')
    }
    
    async exportSettings({ Module, Grp, Data }){
        /*
            Will export selected user to a file    
        */        
        let strTmp = '';        
        // Open a file stream
        const tmpFile = await this.getFileName({Type: 'tmp', Module: Module, Grp: Grp});        
        var fs = require('fs');        
        var stream = fs.createWriteStream(tmpFile, {flags:'a'});
        // Add the header
        this.header.forEach(function (item) {
            strTmp += item + pmssettings.separator;                
          }
        );
        // Remove last separator and add CR
        strTmp = strTmp.slice(0,-1) + "\n";
        // Write header to tmp file
        stream.write( strTmp );
        // Add Data
        if ( Grp === "All"){
            Object.keys(Data).forEach(function(category){
                Data[category].forEach(function (item) {                    
                    // Category
                    strTmp = category + pmssettings.separator;
                    // Name
                    strTmp += Object.keys(item)[0] + pmssettings.separator;
                    // Remaining fields
                    pmssettings.itemfields.forEach(function (field) {
                        try{
                            let result = item[Object.keys(item)[0]][field];
                            if (result == null){
                                result = wtconfig.get('ET.NotAvail'); 
                            }
                            strTmp += result + pmssettings.separator;                                                                               
                        }
                        catch (error){
                            log.error(`PMS Export Single error: ${error}`);                            
                        }
                    });
                    // Remove last separator and add CR
                    strTmp = strTmp.slice(0,-1) + "\n";                    
                    // Write to tmp file
                    stream.write( strTmp );
                });
            });
        }
        else {         
            Data[Grp].forEach(function (item) {
                Object.keys(item).forEach(function(key) {
                    // Category
                    strTmp = Grp + pmssettings.separator;
                    // Name
                    strTmp += Object.keys(item)[0] + pmssettings.separator;
                    // Remaining fields
                    pmssettings.itemfields.forEach(function (field) {
                        try{
                            let result = item[key][field];
                            if (result == null){
                                result = wtconfig.get('ET.NotAvail'); 
                            }
                            strTmp += result + pmssettings.separator;                                                                               
                        }
                        catch (error){
                            log.error(`PMS Export Single error: ${error}`);                            
                        }

                    });
                    // Remove last separator and add CR
                    strTmp = strTmp.slice(0,-1) + "\n";                    
                    // Write to tmp file
                    stream.write( strTmp );
                });
            });                
        }
        // Close tmp file
        stream.end();
        // Rename to real file name
        var newFile = tmpFile.replace('.tmp', '.csv');
        fs.renameSync(tmpFile, newFile);
        log.info('renamed complete');
    }

    async getFileName({ Type, Module, Grp }){
        /*
            Will create the output directory if it doesn't exists 
            Will return a string with the filename to use
        */
        const dateFormat = require('dateformat');
        const OutDir = wtconfig.get('General.ExportPath');
        const timeStamp=dateFormat(new Date(), "yyyy.mm.dd_h.MM.ss"); 
        const path = require('path');
        let outFile = Grp + '_';                
        outFile += timeStamp + '.' + Type;
        const targetDir = path.join(
            OutDir, wtutils.AppName, Module);
        const outFileWithPath = path.join(
            targetDir, outFile);                
        // Make sure target dir exists
        const fs = require('fs')
        if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
        }        
        log.info(`OutFile is ${outFileWithPath}`)                     
        return outFileWithPath;
    }
}



export {pmssettings};