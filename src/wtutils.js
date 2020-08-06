/* 
This file contains different functions and methods
that we use in our solution.
 */

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

    get UserHomeDir() {
        return (electron.app || electron.remote.app).getPath('home');
    }

    get UserDocFld() {
        return (electron.app || electron.remote.app).getPath('documents');
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
        log.verbose(`LocalHome detected as: ${localHome}`)            
        const items = fs.readdirSync(localHome)  
        log.verbose(`Files count is: ${items.length}`)        
        for (var i=0; i<items.length; i++) {                                    
            log.verbose(`found translation file : ${items[i]}`);        
            langFiles.push(items[i]);
        }
        log.verbose(`********* Done reading translations ***********`)          
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
            if (wtutils.isWindows)
            {
                localHome = __dirname.replace('node_modules\\electron\\dist\\resources\\electron.asar\\renderer', 'public/locales');
            }
            else
            {
                localHome = __dirname.replace('node_modules/electron/dist/resources/electron.asar/renderer', 'public/locales');
            }                                       
        }
        else
        {
        localHome = __dirname.replace('app.asar', 'locales');
        }        
        var last = wtconfig.get('General.transfilescopied', "0")
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
            wtconfig.set('General.transfilescopied', wtutils.AppVersion)
            }                       
    }

    UpdateConfigFile() {
        // Update config file with defaults if missing
        console.log('Updating config file')
        // General section
        if ( wtconfig.get('General.username', 'N/A') == 'N/A' ){
            wtconfig.set('General.username', '')
        }
        if ( wtconfig.get('General.language', 'N/A') == 'N/A' ){
            wtconfig.set('General.language', 'en')
        }
        if ( wtconfig.get('General.rememberlastusername', 'N/A') == 'N/A' ){
            wtconfig.set('General.rememberlastusername', false)
        }
        if ( wtconfig.get('General.transfilescopied', 'N/A') == 'N/A' ){
            wtconfig.set('General.transfilescopied', '')
        }
        // Log settings
        if ( wtconfig.get('Log.maxSize', 'N/A') == 'N/A' ){
            wtconfig.set('Log.maxSize', '10485760')
        }
        if ( wtconfig.get('Log.fileLevel', 'N/A') == 'N/A' ){
            wtconfig.set('Log.fileLevel', 'info')
        }
        if ( wtconfig.get('Log.consoleLevel', 'N/A') == 'N/A' ){
            wtconfig.set('Log.consoleLevel', 'info')
        }
        // PMS Settings
        if ( wtconfig.get('PMS.TimeOut', 'N/A') == 'N/A' ){
            wtconfig.set('PMS.TimeOut', 20)
        }
        if ( wtconfig.get('PMS.ContainerSize.artist', 'N/A') == 'N/A' ){
            wtconfig.set('PMS.ContainerSize.artist', 10)
        }
        if ( wtconfig.get('PMS.ContainerSize.episode', 'N/A') == 'N/A' ){
            wtconfig.set('PMS.ContainerSize.episode', 20)
        }
        if ( wtconfig.get('PMS.ContainerSize.movie', 'N/A') == 'N/A' ){
            wtconfig.set('PMS.ContainerSize.movie', 20)
        }
        if ( wtconfig.get('PMS.ContainerSize.photo', 'N/A') == 'N/A' ){
            wtconfig.set('PMS.ContainerSize.photo', 20)
        }
        if ( wtconfig.get('PMS.ContainerSize.show', 'N/A') == 'N/A' ){
            wtconfig.set('PMS.ContainerSize.show', 20)
        }
        // ET Settings
        if ( wtconfig.get('ET.ArraySep', 'N/A') == 'N/A' ){
            wtconfig.set('ET.ArraySep', '-')
        }
        if ( wtconfig.get('ET.ColumnSep', 'N/A') == 'N/A' ){
            wtconfig.set('ET.ColumnSep', ',')
        }        
        if ( wtconfig.get('ET.OutPath', 'N/A') == 'N/A' ){
            wtconfig.set('ET.OutPath', '')
        }

        

        // All done, so stamp version number
        wtconfig.set('General.version', wtutils.AppVersion)
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

    OpenDirectory(Title, OKLabel)
    {
        log.debug('Start OpenDirectory Dialog')
        const {remote} = require('electron'),
        dialog = remote.dialog,
        WIN = remote.getCurrentWindow();
        let options = {
            properties:["openDirectory"],
            buttonLabel : OKLabel,
            title: Title
        }
        
        let dirName = dialog.showOpenDialogSync(WIN, options)
        log.debug('Returned directoryname is: ' + dirName)
        return dirName

    }
            
    SaveFile(title, defaultPath, OKLabel) {        
        log.debug('Start SaveFile Dialog')
        const {remote} = require('electron'),
        dialog = remote.dialog,
        WIN = remote.getCurrentWindow();
        let options = {
            //Placeholder 1 (Not on Linux)
            title: title,            
            //Placeholder 2
            defaultPath : defaultPath,            
            //Placeholder 4
            buttonLabel : OKLabel,            
            //Placeholder 3
            filters :[
             {name: 'ExportTools', extensions: ['xlsx', 'csv']},
             {name: 'All Files', extensions: ['*']}
            ]
           } 
        let filename = dialog.showSaveDialogSync(WIN, options)
        log.debug('Returned filename is: ' + filename)
        return filename
    }

  }

export {wtutils, wtconfig, dialog};