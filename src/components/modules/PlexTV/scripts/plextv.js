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
            i18n.t('Modules.PlexTV.UsrName'),
            i18n.t('Modules.PlexTV.UsrEMail'),
            i18n.t('Modules.PlexTV.UsrRestricted'),
            i18n.t('Modules.PlexTV.UsrName'),
            i18n.t('Modules.PlexTV.UsrThumb'),
            i18n.t('Modules.PlexTV.UsrHome'),
            i18n.t('Modules.PlexTV.UsrStatus')]
    }
    
    async exportUsr({ Type, Module, Usr, Data }){
        /*
            Will export selected user to a file    
        */


        Type, Data

        console.log('Ged0 start Export')   
        console.log('Ged1 Data', JSON.stringify(Data))
        console.log('Ged2 length', Data.length) 
        console.log('Ged3 count', Data.count) 
        
        
        
        // Open a file stream
        const tmpFile = await this.getFileName({Type: 'tmp', Module: Module, Usr: Usr});
        var fs = require('fs');        
        var stream = fs.createWriteStream(tmpFile, {flags:'a'});
        // Add the header
        stream.write( this.header + "\n");
        // Add Data
/* 
        let rowStr = ''


        for( var x in Data ){
            console.log('ged99', JSON.stringify(Data[x]))
            console.log('Ged88', JSON.stringify(Data[x]['title']))
            rowStr = ''
            rowStr += ',' + Data[x]['id'];
            rowStr += ',' + Data[x]['title'];

            
        }
 */
        console.log('Ged OP Type', typeof(Usr))

        if ( typeof(Usr) === "string"){
            console.log('Ged All Users')
        }
        else {
            console.log('Ged Single Usr')
        }

        /* 
        Object.keys(Data).forEach(function(key) {
            console.log('Ged Gummi Key : ' + key + ', Value : ' + Data[key])
            console.log(typeof Data[key]);
        })
 */

 /* 
        for (const [key, value] of Object.entries(Data)) {
            var justAGuy = new Person();

            justAGuy.id = key;
            justAGuy.title = value['title'];

            if (key == 'title')
            {
                console.log('Ged99 Title', value)
                
            }


            //console.log('Ged543', key, JSON.stringify(value));
            //console.log('Ged345', JSON.stringify(justAGuy));
          }
        
         */

/* 
        'Modules.PlexTV.UsrID'),
            i18n.t('Modules.PlexTV.UsrName'),
            i18n.t('Modules.PlexTV.UsrEMail'),
            i18n.t('Modules.PlexTV.UsrRestricted'),
            i18n.t('Modules.PlexTV.UsrName'),
            i18n.t('Modules.PlexTV.UsrThumb'),
            i18n.t('Modules.PlexTV.UsrHome'),
            i18n.t('Modules.PlexTV.UsrStatus')]


             */
        
        
        let str = '';

        str

        Person

        
        //await stream.write( result + "\n");




        stream.end(); 

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

class Person {    
    constructor() {      
    }    

    set id(param) {
        this._id = param
    }
        
    set title(param) {
        this._title = param
    }
    get title() {
        return this._title
    }
    
  }

export {plextv};