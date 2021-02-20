// Helper file for plex.tv module
const log = require('electron-log');
console.log = log.log;


import {wtconfig, wtutils} from '../../General/wtutils';
import i18n from '../../../../i18n';
import store from '../../../../store';

i18n, wtconfig, wtutils, store


const plextv = new class PlexTV {
    constructor() {
        this.header = [
            i18n.t('Modules.PlexTV.UsrID'),            
            i18n.t('Modules.PlexTV.UsrTitle'),
            i18n.t('Modules.PlexTV.UsrName'),
            i18n.t('Modules.PlexTV.UsrEMail'),
            i18n.t('Modules.PlexTV.UsrRestricted'),            
            i18n.t('Modules.PlexTV.UsrThumb'),
            i18n.t('Modules.PlexTV.UsrHome'),
            i18n.t('Modules.PlexTV.UsrStatus')]
        this.fields = [
            'id',
            'title',
            'username',
            'email',
            'restricted',
            'thumb',
            'home',
            'status'
        ],
        this.separator = wtconfig.get('ET.ColumnSep')
    }
    
    async exportUsr({ Module, Usr, Data }){
        /*
            Will export selected user to a file    
        */
        let strTmp = '';
        // Set result file to users title
        let fName = 'All';        
        if ( typeof(Usr) === "number"){
            fName = Data['title'];
        }
        // Open a file stream
        const tmpFile = await this.getFileName({Type: 'tmp', Module: Module, Usr: fName});
        var fs = require('fs');        
        var stream = fs.createWriteStream(tmpFile, {flags:'a'});
        // Add the header
        this.header.forEach(function (item) {
            strTmp += item + plextv.separator;                
          }
        );
        // Remove last separator and add CR
        strTmp = strTmp.slice(0,-1) + "\n";
        // Write header to tmp file
        stream.write( strTmp );
        // Add Data
        if ( typeof(Usr) === "string"){                        
            Object.keys(Data).forEach(function(key) {
                strTmp = '';
                plextv.fields.forEach(function (item) {
                    let result = Data[key][item];
                    if (result == null){
                        result = wtconfig.get('ET.NotAvail'); 
                    }
                    strTmp += result + plextv.separator;                
                  }
                );
                // Remove last separator and add CR
                strTmp = strTmp.slice(0,-1) + "\n";
                // Write to tmp file
                stream.write( strTmp );                
            })
        }
        else {            
            strTmp = '';
            // Add each field            
            this.fields.forEach(function (item) {
                let result = Data[item];
                if (result == null){
                    result = wtconfig.get('ET.NotAvail'); 
                }
                strTmp += result + plextv.separator;
                //strTmp += Data[item] + plextv.separator;                
              }
            );
            // Remove last separator and add CR
            strTmp = strTmp.slice(0,-1) + "\n";
            // Write to tmp file
            stream.write( strTmp );        
        }
        // Close tmp file
        stream.end();
        // Rename to real file name
        var newFile = tmpFile.replace('.tmp', '.csv');
        fs.renameSync(tmpFile, newFile);                      
        console.log('renamed complete');
    }

    async getFileName({ Type, Module, Usr }){
        /*
            Will create the output directory if it doesn't exists 
            Will return a string with the filename to use
        */
        const dateFormat = require('dateformat');
        const OutDir = wtconfig.get('General.ExportPath');
        const timeStamp=dateFormat(new Date(), "yyyy.mm.dd_h.MM.ss"); 
        const path = require('path');
        let outFile = Usr + '_';                
        outFile += timeStamp + '.' + Type;
        const targetDir = path.join(
            OutDir, wtutils.AppName, Module);
        const outFileWithPath = path.join(
            targetDir, outFile);                
        // Make sure target dir exists
        const fs = require('fs')
        if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir);
        }        
        log.info(`OutFile is ${outFileWithPath}`)                     
        return outFileWithPath;
    }
}



export {plextv};