/* 
This file contains different functions and methods
that we use in our solution.
Can be used both from rendering and from main
 */

import i18n from './i18n'
const log = require('electron-log');
const electron = require('electron');
// User Config 
const Store = require('electron-store');
const wtconfig = new Store({name: require('electron').remote.app.getName()});

const wtutils = new class WTUtils {

    constructor() {      
    }

    get isDev() {
        return require('electron-is-dev');
    }

    get isMac() {
       return process.platform === 'darwin' 
    }

    get isLinux() {
        return process.platform === 'linux'
    }

    get isWindows() {
        return process.platform === 'win32'
    }
  
    get Home() {
      return (electron.app || electron.remote.app).getPath('userData');
    }

    get AppName() {
        return (electron.app || electron.remote.app).getName(); 
    }

    get AppVersion() {
        return (electron.app || electron.remote.app).getVersion(); 
    }

    get LangFiles() {
        const langFiles = []
        var fs = require('fs');    
        const localHome = wtutils.Home + '/locales'  
        console.log('LocalHome detected as: ' + localHome);    
        const items = fs.readdirSync(localHome)                   
        console.log('Files count is: ' + items.length)
        for (var i=0; i<items.length; i++) {                                    
            console.log('found translation file : ' + items[i]);        
            langFiles.push(items[i]);
        }
        console.log('********* Done reading translations ***********')          
        return langFiles
    }

    get LogLinux() {
        return wtutils.Home + '/logs';
    }

    get LogWin() {
        return wtutils.Home + '\\logs';
    }

    get LogMac() {
        // does this work?
        console.log('******* Need Help here ***********');
        console.log('Mac Log dir detected as : ' + wtutils.Home + '/Library/Logs/' + wtutils.AppName);
        console.log('********* Is that correct? ********** ');
        return wtutils.Home + '/Library/Logs/' + wtutils.AppName;
    }

    /* 
    This will move translation files in the app to userdata
    directory in a sub-folder named locales 
    It will only do so if this has not been done before or 
    this is a new version of our app
     */
    MoveToHome() {
        var localHome = '';
        if (wtutils.isDev)
        {
        localHome = __dirname.replace('node_modules/electron/dist/resources/electron.asar/renderer', 'public/locales');
        }
        else
        {
        localHome = __dirname.replace('app.asar', 'locales');
        }        
        var last = wtconfig.get('general.transfilescopied', "0")
        if (!(last == wtutils.AppVersion))
        {
            log.debug('We need to copy translation strings over')            
            var fs = require('fs');
            // Check if userdata/locales exists, and create if not
            var TargetDir = wtutils.Home + '/locales';
            if (!fs.existsSync(TargetDir)){
                log.debug('locales directory needs to be created');
                fs.mkdirSync(TargetDir);
            } 
            const items = fs.readdirSync(localHome)                                      
            for (var i=0; i<items.length; i++) {                                    
                var SourceFile = localHome + '/' + items[i];                                 
                var TargetFile = TargetDir + '/' + items[i];
                log.debug('Copying ' + SourceFile + ' to ' + TargetFile);
                fs.copyFile(SourceFile, TargetFile, err => {  
                    if (err) return console.error(err)                        
                });                  
            }        
            wtconfig.set('general.transfilescopied', wtutils.AppVersion)
            }                       
    }

    /* set name(value) {
      if (value.length < 4) {
        alert("Name is too short.");
        return;
      }
      this._name = value;
    } */
  }  
  
  const dialog = new class Dialog {
    constructor() { 
                   
    }
            
    SelectFile(title, defaultPath) {
        console.log('Ged start dialog')
        const {remote} = require('electron'),
        dialog = remote.dialog,
        WIN = remote.getCurrentWindow(); 
        const lOK = i18n.t('Common.Ok');
        console.log('OK Label: ' + lOK);
        let options = {
            //Placeholder 1 (Not on Linux)
            title: title,            
            //Placeholder 2
            defaultPath : defaultPath,            
            //Placeholder 4
            buttonLabel : "Ok", 
            //buttonLabel : lOK,           
            //buttonLabel : "{{ i18n.__('Common.Ok') }}",            
            //Placeholder 3
            filters :[
             {name: 'ExportTools', extensions: ['xlsx', 'csv']},
             {name: 'All Files', extensions: ['*']}
            ]
           } 
        let filename = dialog.showSaveDialogSync(WIN, options)
        return filename
    }

  }

export {wtutils, wtconfig, dialog};