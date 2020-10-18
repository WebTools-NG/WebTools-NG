/* 
This file contains different functions and methods
that we use in our solution.
 */

//import i18n from '../../../i18n';

const log = require('electron-log');
console.log = log.log;
const electron = require('electron');
// User Config 
const Store = require('electron-store');
const wtconfig = new Store({ name: (electron.app || electron.remote.app).getName() });

const wtutils = new class WTUtils {

    constructor() {      
    }

    get ConfigFileName(){
        var path = require('path');
        const configFileName = path.join( this.Home, this.AppName + '.json');                
        return configFileName;
    }

    get RunningOS(){
        return process.platform;
    }

    get PMSHeader(){        
        var headers = {
            "Accept": "application/json",
            "X-Plex-Client-Identifier": this.X_Plex_Client_Identifier,
            "X-Plex-Product": this.AppName,
            "X-Plex-Version": this.AppVersion,
            "X-Plex-Device": this.Platform                  
        }   
        return headers        
    }

    get Platform() {
        let OS = undefined;
        if (this.isMac)
        {
            OS = 'Mac'
        }
        else if (this.isLinux)
        {
            OS = 'Linux'
        }
        else if (this.isWindows)
        {
            OS = 'Windows'
        }
        return OS
    }

    // Get X_Plex_Client_Identifier, or create one if not set
    get X_Plex_Client_Identifier() {        
        let result = wtconfig.get('General.X_Plex_Client_Identifier' )
        if (result == undefined)
        {            
            var uuid = require('uuid');
            result = uuid.v4();
            wtconfig.set('General.X_Plex_Client_Identifier', result)
            log.debug(`Setting X_Plex_Client_Identifier as ${result}`)
        }        
        return result;
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
        return (electron.app || electron.remote.app).name; 
    }

    /*
    This function will return the revision number of the app,
    based on the current GitHub Branch commit hash */
    get Rev() {
        return require('../../../../public/version.json').rev;
    }

    get AppVersion() {        
        return (electron.app || electron.remote.app).getVersion() + '.' + this.Rev; 
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
        const logDir = wtutils.Home.replace('Application Support', 'Logs');        
        log.info(`Log directory on Mac is detected as: ${logDir}`)
        return logDir;
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
            else if (wtutils.isMac)
            {                
                localHome = __dirname.replace('node_modules/electron/dist/Electron.app/Contents/Resources/electron.asar/renderer', 'public/locales');
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
        log.verbose('Updating config file');
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
        if ( wtconfig.get('ET.NotAvail', 'N/A') == 'N/A' ){
            wtconfig.set('ET.NotAvail', 'N/A')
        }
        if ( wtconfig.get('ET.CustomLevels.episode.levels', 'N/A') == 'N/A' ){
            wtconfig.set('ET.CustomLevels.episode.levels', {})
        }
        if ( wtconfig.get('ET.CustomLevels.episode.level', 'N/A') == 'N/A' ){
            wtconfig.set('ET.CustomLevels.episode.level', {})
        }
        if ( wtconfig.get('ET.CustomLevels.episode.LevelCount', 'N/A') == 'N/A' ){
            wtconfig.set('ET.CustomLevels.episode.LevelCount', {})
        }
        if ( wtconfig.get('ET.CustomLevels.movie.levels', 'N/A') == 'N/A' ){
            wtconfig.set('ET.CustomLevels.movie.levels', {})
        }
        if ( wtconfig.get('ET.CustomLevels.movie.LevelCount', 'N/A') == 'N/A' ){
            wtconfig.set('ET.CustomLevels.movie.LevelCount', {})
        }
        if ( wtconfig.get('ET.CustomLevels.movie.level', 'N/A') == 'N/A' ){
            wtconfig.set('ET.CustomLevels.movie.level', {})
        }
        if ( wtconfig.get('ET.CustomLevels.show.levels', 'N/A') == 'N/A' ){
            wtconfig.set('ET.CustomLevels.show.levels', {})
        }
        if ( wtconfig.get('ET.CustomLevels.show.LevelCount', 'N/A') == 'N/A' ){
            wtconfig.set('ET.CustomLevels.show.LevelCount', {})
        }
        if ( wtconfig.get('ET.CustomLevels.show.level', 'N/A') == 'N/A' ){
            wtconfig.set('ET.CustomLevels.show.level', {})
        }
        if ( wtconfig.get('ET.CustomLevels.showepisode.levels', 'N/A') == 'N/A' ){
            wtconfig.set('ET.CustomLevels.showepisode.levels', {})
        }
        if ( wtconfig.get('ET.CustomLevels.showepisode.LevelCount', 'N/A') == 'N/A' ){
            wtconfig.set('ET.CustomLevels.showepisode.LevelCount', {})
        }
        if ( wtconfig.get('ET.CustomLevels.showepisode.level', 'N/A') == 'N/A' ){
            wtconfig.set('ET.CustomLevels.showepisode.level', {})
        }
        if ( wtconfig.get('ET.CustomLevels.artist.levels', 'N/A') == 'N/A' ){
            wtconfig.set('ET.CustomLevels.artist.levels', {})
        }
        if ( wtconfig.get('ET.CustomLevels.artist.LevelCount', 'N/A') == 'N/A' ){
            wtconfig.set('ET.CustomLevels.artist.LevelCount', {})
        }
        if ( wtconfig.get('ET.CustomLevels.artist.level', 'N/A') == 'N/A' ){
            wtconfig.set('ET.CustomLevels.artist.level', {})
        }
        if ( wtconfig.get('ET.CustomLevels.photo.levels', 'N/A') == 'N/A' ){
            wtconfig.set('ET.CustomLevels.photo.levels', {})
        }
        if ( wtconfig.get('ET.CustomLevels.photo.LevelCount', 'N/A') == 'N/A' ){
            wtconfig.set('ET.CustomLevels.photo.LevelCount', {})
        }
        if ( wtconfig.get('ET.CustomLevels.photo.level', 'N/A') == 'N/A' ){
            wtconfig.set('ET.CustomLevels.photo.level', {})
        }
        if ( wtconfig.get('ET.CustomLevels.playlist.levels', 'N/A') == 'N/A' ){
            wtconfig.set('ET.CustomLevels.playlist.levels', {})
        }
        if ( wtconfig.get('ET.CustomLevels.playlist.LevelCount', 'N/A') == 'N/A' ){
            wtconfig.set('ET.CustomLevels.playlist.LevelCount', {})
        }
        if ( wtconfig.get('ET.CustomLevels.playlist.level', 'N/A') == 'N/A' ){
            wtconfig.set('ET.CustomLevels.playlist.level', {})
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

    AboutWindow(Title, OKLabel, CopyLabel, aboutInformation)
    {
        log.debug('Open AboutWindow Dialog')
        const {remote} = require('electron'),
        dialog = remote.dialog,
        WIN = remote.getCurrentWindow();
        let options = {
            buttons: [OKLabel, CopyLabel],
            title: Title,
            message: 'WebTools-NG',
            detail: aboutInformation,
            type: 'info',
            noLink: true
        }
        let aboutWindow = dialog.showMessageBox(WIN, options)
        return aboutWindow
    }    

    OpenDirectory(Title, OKLabel)
    {
        log.debug('Start OpenDirectory Dialog')
       // const {remote, app} = require('electron'),
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

const github = new class GitHub {
    constructor() {        
        this.releaseUrl = 'https://api.github.com/repos/WebTools-NG/WebTools-NG/releases';
    }

    // Get the releases from GitHub
    async Releases(){
        const fetch = require('node-fetch');                
        const response = await fetch(this.releaseUrl);        
        const releases = await response.json();
        return releases;
    }    
}


export {wtutils, wtconfig, dialog, github};