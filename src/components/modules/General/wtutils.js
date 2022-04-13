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
        this.logFileName = this.AppName + '.log';
    }

    get ConfigFileName(){
        var path = require('path');
        const configFileName = path.join( this.Home, this.AppName + '.json');
        return configFileName;
    }

    get ExportDirPresent(){
        log.info('Checking ExportPath')
        const ExportPath = wtconfig.get('General.ExportPath', 'N/A');
        if ( ExportPath == 'N/A' ){
            log.error('ExportPath not defined');
            return false;
        }
        const fs = require("fs");
        if (fs.existsSync(ExportPath)) {
            const path = require('path');
            const appExportDir = path.join(ExportPath, wtutils.AppName);
            if (!fs.existsSync(appExportDir))
            {
                log.debug('Export dir existed, but AppDir didnt')
                fs.mkdirSync(appExportDir)
                if (fs.existsSync(appExportDir))
                {
                    return true;
                }
                else
                {
                    return false;
                }
            }
            else
            {
                return true;
            }
        }
        return false;


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
            "X-Plex-Device": this.Platform,
            "Accept-Language": wtconfig.get('General.language')
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

    get ShortAppVersion() {
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

    hideMenu(menu)
    {
        let retVal = false;        
        log.debug(`Start menu check for ${menu}`);
        // If indeveloper mode, always return false
        if (this.isDev){
            log.debug('We are running in dev mode, so turn on all menues');
            retVal = false;
        }
        else
        {
            retVal = wtconfig.get('Menu.' + menu, true);
        }
        log.debug(`Menu returning ${retVal}`);
        return retVal
    }

    UpdateConfigFile() {
        // Update config file with defaults if missing
        log.verbose('Updating config file');
        // Hide/Show Menu
        if ( wtconfig.get('Menu.plextv', 'N/A') == 'N/A' ){
            wtconfig.set('Menu.plextv', false)
        }
        if ( wtconfig.get('Menu.pms', 'N/A') == 'N/A' ){
            wtconfig.set('Menu.pms', false)
        }
        if ( wtconfig.get('Menu.pmsSettings', 'N/A') == 'N/A' ){
            wtconfig.set('Menu.pmsSettings', false)
        }
        if ( wtconfig.get('Menu.pmsButler', 'N/A') == 'N/A' ){
            wtconfig.set('Menu.pmsButler', false)
        }        
        if ( wtconfig.get('Menu.et', 'N/A') == 'N/A' ){
            wtconfig.set('Menu.et', false)
        }
        if ( wtconfig.get('Menu.etSettings', 'N/A') == 'N/A' ){
            wtconfig.set('Menu.etSettings', false)
        }
        if ( wtconfig.get('Menu.etCustom', 'N/A') == 'N/A' ){
            wtconfig.set('Menu.etCustom', false)
        }
        if ( wtconfig.get('Menu.Language', 'N/A') == 'N/A' ){
            wtconfig.set('Menu.Language', false)
        }
        if ( wtconfig.get('Menu.Settings', 'N/A') == 'N/A' ){
            wtconfig.set('Menu.Settings', false)
        }
        if ( wtconfig.get('Menu.About', 'N/A') == 'N/A' ){
            wtconfig.set('Menu.About', false)
        }


        


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
        if ( wtconfig.get('PMS.ContainerSize.8', 'N/A') == 'N/A' ){
            wtconfig.set('PMS.ContainerSize.8', 20)
        }
        if ( wtconfig.get('PMS.ContainerSize.4', 'N/A') == 'N/A' ){
            wtconfig.set('PMS.ContainerSize.4', 20)
        }
        if ( wtconfig.get('PMS.ContainerSize.1', 'N/A') == 'N/A' ){
            wtconfig.set('PMS.ContainerSize.1', 50)
        }
        if ( wtconfig.get('PMS.ContainerSize.13', 'N/A') == 'N/A' ){
            wtconfig.set('PMS.ContainerSize.13', 20)
        }
        if ( wtconfig.get('PMS.ContainerSize.2', 'N/A') == 'N/A' ){
            wtconfig.set('PMS.ContainerSize.2', 20)
        }
        if ( wtconfig.get('PMS.ContainerSize.10', 'N/A') == 'N/A' ){
            wtconfig.set('PMS.ContainerSize.10', 20)
        }
        if ( wtconfig.get('PMS.ContainerSize.9', 'N/A') == 'N/A' ){
            wtconfig.set('PMS.ContainerSize.9', 20)
        }
        if ( wtconfig.get('PMS.ContainerSize.15', 'N/A') == 'N/A' ){
            wtconfig.set('PMS.ContainerSize.15', 20)
        }
        if ( wtconfig.get('PMS.ContainerSize.1002', 'N/A') == 'N/A' ){
            wtconfig.set('PMS.ContainerSize.1002', 20)
        }
        if ( wtconfig.get('PMS.ContainerSize.3001', 'N/A') == 'N/A' ){
            wtconfig.set('PMS.ContainerSize.3001', 20)
        }
        // ET Settings
        if ( wtconfig.get('ET.ChReturn', 'N/A') == 'N/A' ){
            wtconfig.set('ET.ChReturn', '<RETURN>')
        }
        if ( wtconfig.get('ET.ChNewLine', 'N/A') == 'N/A' ){
            wtconfig.set('ET.ChNewLine', '<NEWLINE>')
        }
        if ( wtconfig.get('ET.TextQualifierCSV', 'N/A') == 'N/A' ){
            wtconfig.set('ET.TextQualifierCSV', '"')
        }
        if ( wtconfig.get('ET.ArraySep', 'N/A') == 'N/A' ){
            wtconfig.set('ET.ArraySep', '-')
        }
        if ( wtconfig.get('ET.ColumnSep', 'N/A') == 'N/A' ){
            wtconfig.set('ET.ColumnSep', '|')
        }
        if ( wtconfig.get('ET.NotAvail', 'N/A') == 'N/A' ){
            wtconfig.set('ET.NotAvail', 'N/A')
        }
        // CustLevels sub keys
        if ( wtconfig.get('ET.CustomLevels.4.levels', 'N/A') == 'N/A' ){
            wtconfig.set('ET.CustomLevels.4.levels', {})
        }
        if ( wtconfig.get('ET.CustomLevels.4.level', 'N/A') == 'N/A' ){
            wtconfig.set('ET.CustomLevels.4.level', {})
        }
        if ( wtconfig.get('ET.CustomLevels.4.LevelCount', 'N/A') == 'N/A' ){
            wtconfig.set('ET.CustomLevels.4.LevelCount', {})
        }
        if ( wtconfig.get('ET.CustomLevels.1.levels', 'N/A') == 'N/A' ){
            wtconfig.set('ET.CustomLevels.1.levels', {})
        }
        if ( wtconfig.get('ET.CustomLevels.1.LevelCount', 'N/A') == 'N/A' ){
            wtconfig.set('ET.CustomLevels.1.LevelCount', {})
        }
        if ( wtconfig.get('ET.CustomLevels.1.level', 'N/A') == 'N/A' ){
            wtconfig.set('ET.CustomLevels.1.level', {})
        }
        if ( wtconfig.get('ET.CustomLevels.2.levels', 'N/A') == 'N/A' ){
            wtconfig.set('ET.CustomLevels.2.levels', {})
        }
        if ( wtconfig.get('ET.CustomLevels.2.LevelCount', 'N/A') == 'N/A' ){
            wtconfig.set('ET.CustomLevels.2.LevelCount', {})
        }
        if ( wtconfig.get('ET.CustomLevels.2.level', 'N/A') == 'N/A' ){
            wtconfig.set('ET.CustomLevels.2.level', {})
        }
        if ( wtconfig.get('ET.CustomLevels.8.levels', 'N/A') == 'N/A' ){
            wtconfig.set('ET.CustomLevels.8.levels', {})
        }
        if ( wtconfig.get('ET.CustomLevels.8.LevelCount', 'N/A') == 'N/A' ){
            wtconfig.set('ET.CustomLevels.8.LevelCount', {})
        }
        if ( wtconfig.get('ET.CustomLevels.8.level', 'N/A') == 'N/A' ){
            wtconfig.set('ET.CustomLevels.8.level', {})
        }
        if ( wtconfig.get('ET.CustomLevels.10.levels', 'N/A') == 'N/A' ){
            wtconfig.set('ET.CustomLevels.10.levels', {})
        }
        if ( wtconfig.get('ET.CustomLevels.10.LevelCount', 'N/A') == 'N/A' ){
            wtconfig.set('ET.CustomLevels.10.LevelCount', {})
        }
        if ( wtconfig.get('ET.CustomLevels.10.level', 'N/A') == 'N/A' ){
            wtconfig.set('ET.CustomLevels.10.level', {})
        }
        if ( wtconfig.get('ET.CustomLevels.9.levels', 'N/A') == 'N/A' ){
            wtconfig.set('ET.CustomLevels.9.levels', {})
        }
        if ( wtconfig.get('ET.CustomLevels.9.LevelCount', 'N/A') == 'N/A' ){
            wtconfig.set('ET.CustomLevels.9.LevelCount', {})
        }
        if ( wtconfig.get('ET.CustomLevels.9.level', 'N/A') == 'N/A' ){
            wtconfig.set('ET.CustomLevels.9.level', {})
        }
        if ( wtconfig.get('ET.CustomLevels.13.levels', 'N/A') == 'N/A' ){
            wtconfig.set('ET.CustomLevels.13.levels', {})
        }
        if ( wtconfig.get('ET.CustomLevels.13.LevelCount', 'N/A') == 'N/A' ){
            wtconfig.set('ET.CustomLevels.13.LevelCount', {})
        }
        if ( wtconfig.get('ET.CustomLevels.13.level', 'N/A') == 'N/A' ){
            wtconfig.set('ET.CustomLevels.13.level', {})
        }
        // Playlists
        if ( wtconfig.get('ET.CustomLevels.2001.levels', 'N/A') == 'N/A' ){
            wtconfig.set('ET.CustomLevels.2001.levels', {})
        }
        if ( wtconfig.get('ET.CustomLevels.2001.LevelCount', 'N/A') == 'N/A' ){
            wtconfig.set('ET.CustomLevels.2001.LevelCount', {})
        }
        if ( wtconfig.get('ET.CustomLevels.2001.level', 'N/A') == 'N/A' ){
            wtconfig.set('ET.CustomLevels.2001.level', {})
        }
        if ( wtconfig.get('ET.CustomLevels.2003.levels', 'N/A') == 'N/A' ){
            wtconfig.set('ET.CustomLevels.2003.levels', {})
        }
        if ( wtconfig.get('ET.CustomLevels.2003.LevelCount', 'N/A') == 'N/A' ){
            wtconfig.set('ET.CustomLevels.2003.LevelCount', {})
        }
        if ( wtconfig.get('ET.CustomLevels.2003.level', 'N/A') == 'N/A' ){
            wtconfig.set('ET.CustomLevels.2003.level', {})
        }
        if ( wtconfig.get('ET.CustomLevels.2002.levels', 'N/A') == 'N/A' ){
            wtconfig.set('ET.CustomLevels.2002.levels', {})
        }
        if ( wtconfig.get('ET.CustomLevels.2002.LevelCount', 'N/A') == 'N/A' ){
            wtconfig.set('ET.CustomLevels.2002.LevelCount', {})
        }
        if ( wtconfig.get('ET.CustomLevels.2002.level', 'N/A') == 'N/A' ){
            wtconfig.set('ET.CustomLevels.2002.level', {})
        }
        // rename cust levels
        if ( wtconfig.get('ET.CustomLevels.movie', 'N/A') != 'N/A' ){
            wtconfig.set('ET.CustomLevels.1', wtconfig.get('ET.CustomLevels.movie', 'N/A'));
            wtconfig.delete('ET.CustomLevels.movie');
        }
        if ( wtconfig.get('ET.CustomLevels.show', 'N/A') != 'N/A' ){
            wtconfig.set('ET.CustomLevels.2', wtconfig.get('ET.CustomLevels.show', 'N/A'));
            wtconfig.delete('ET.CustomLevels.show');
        }
        if ( wtconfig.get('ET.CustomLevels.episode', 'N/A') != 'N/A' ){
            wtconfig.set('ET.CustomLevels.4', wtconfig.get('ET.CustomLevels.episode', 'N/A'));
            wtconfig.delete('ET.CustomLevels.episode');
        }
        if ( wtconfig.get('ET.CustomLevels.artist', 'N/A') != 'N/A' ){
            wtconfig.set('ET.CustomLevels.8', wtconfig.get('ET.CustomLevels.artist', 'N/A'));
            wtconfig.delete('ET.CustomLevels.artist');
        }
        if ( wtconfig.get('ET.CustomLevels.artist', 'N/A') != 'N/A' ){
            wtconfig.set('ET.CustomLevels.8', wtconfig.get('ET.CustomLevels.artist', 'N/A'));
            wtconfig.delete('ET.CustomLevels.artist');
        }
        if ( wtconfig.get('ET.CustomLevels.playlist-audio', 'N/A') != 'N/A' ){
            wtconfig.set('ET.CustomLevels.2001', wtconfig.get('ET.CustomLevels.playlist-audio', 'N/A'));
            wtconfig.delete('ET.CustomLevels.playlist-audio');
        }
        if ( wtconfig.get('ET.CustomLevels.track', 'N/A') != 'N/A' ){
            wtconfig.set('ET.CustomLevels.10', wtconfig.get('ET.CustomLevels.track', 'N/A'));
            wtconfig.delete('ET.CustomLevels.track');
        }
        if ( wtconfig.get('ET.CustomLevels.album', 'N/A') != 'N/A' ){
            wtconfig.set('ET.CustomLevels.9', wtconfig.get('ET.CustomLevels.album', 'N/A'));
            wtconfig.delete('ET.CustomLevels.album');
        }
        if ( wtconfig.get('ET.CustomLevels.photo', 'N/A') != 'N/A' ){
            wtconfig.set('ET.CustomLevels.13', wtconfig.get('ET.CustomLevels.photo', 'N/A'));
            wtconfig.delete('ET.CustomLevels.photo');
        }
        if ( wtconfig.get('ET.CustomLevels.playlist-photo', 'N/A') != 'N/A' ){
            wtconfig.set('ET.CustomLevels.2003', wtconfig.get('ET.CustomLevels.playlist-photo', 'N/A'));
            wtconfig.delete('ET.CustomLevels.playlist-photo');
        }
        if ( wtconfig.get('ET.CustomLevels.playlist-video', 'N/A') != 'N/A' ){
            wtconfig.set('ET.CustomLevels.2002', wtconfig.get('ET.CustomLevels.playlist-video', 'N/A'));
            wtconfig.delete('ET.CustomLevels.playlist-video');
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

    SelectFile(Title, OKLabel, filter, defaultPath)
    {
        log.debug('Start SelectFile Dialog');        
        const {remote} = require('electron'),
        dialog = remote.dialog,
        WIN = remote.getCurrentWindow();
        let options = {
            properties:["openFile"],
            buttonLabel : OKLabel,
            title: Title,
            filters: filter,
            defaultPath: defaultPath
        }
        let fileName = dialog.showOpenDialogSync(WIN, options);        
        log.debug('Returned filename is: ' + fileName)
        return fileName
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

    ShowMsgBox(message, type, title, buttons){
        const {remote} = require('electron'),
        dialog = remote.dialog,

        WIN = remote.getCurrentWindow();
        let options = {
            message: message,
            type: type,
            title: title,
            buttons: buttons
        }
        return dialog.showMessageBoxSync(WIN, options);
    }
}

const github = new class GitHub {
    constructor() {
        this.releaseUrl = 'https://api.github.com/repos/WebTools-NG/WebTools-NG/releases';
        this.changeLogUrl = 'https://raw.githubusercontent.com/WebTools-NG/WebTools-NG/master/CHANGELOG.md'
    }

    // Get the changelog from GitHub
    async ChangeLog(){
        log.debug('Fetching Github Release Note')

        const axios = require('axios');
        //let html = '';
        var resp;
        await axios(this.changeLogUrl)
            .then(response => {
                this.data = response.data;
//                resp = this.data.split("## ")[1];
//                resp = resp.split('## ')[0];
                resp = this.data;
            })
            .catch(console.error);
            // Cut so we only show this version
            //var ShortAppVersion = '0.3.11';
            var ShortAppVersion = wtutils.ShortAppVersion;
            resp = resp.substring(resp.indexOf("## V" + ShortAppVersion));
            resp = resp.substring(0, resp.indexOf("## V", 2));
            // Remove link from lines
            const regex = /\([^)]*\)/ig;
            resp = resp.replaceAll(regex, '');
            // Remove * and []
            resp = resp.replaceAll('* [', '').replaceAll(']','');
            // Split into an array
            resp = resp.split("\n");
            return resp;
        }

    // Get the releases from GitHub
    async Releases(){
        log.debug('Checking for Github updates')
        const fetch = require('node-fetch');
        const response = await fetch(this.releaseUrl);
        const releases = await response.json();
        const rels = {};
        rels['beta'] = false;
        rels['rel'] = false;
        rels['betadate'] = false;
        rels['reldate'] = false;
        rels['betadateFull'] = false;
        rels['reldateFull'] = false;

        for(var i = 0; i < releases.length; i++)
        {
            if (rels['beta'] && rels['rel'])
            {
                break;
            }
            if (!rels['beta'] && releases[i].prerelease){
                log.verbose(`Found beta version ${releases[i].tag_name}`)
                rels['betaver'] = releases[i].tag_name;
                rels['beta'] = true;
                rels['betaname'] = releases[i].name;
                rels['betaurl'] = releases[i].html_url;
                rels['betadate'] = releases[i].published_at.substring(0, 10);
                rels['betadateFull'] = releases[i].published_at;
            }
            else if (!rels['rel'] && !releases[i].prerelease){
                log.verbose(`Found release version ${releases[i].tag_name}`)
                rels['relver'] = releases[i].tag_name;
                rels['rel'] = true;
                rels['relname'] = releases[i].name;
                rels['relurl'] = releases[i].html_url;
                rels['relurl'] = releases[i].html_url;
                rels['reldate'] = releases[i].published_at.substring(0, 10);
                rels['reldateFull'] = releases[i].published_at;
            }
        }
        // If not present, set to zerro
        if (!rels['reldateFull']){
            rels['reldateFull'] = 0;
        }
        // If not present, set to zerro
        if (!rels['betadateFull']){
            rels['betadateFull'] = 0;
        }
        var s1 = '';
        if (rels['betaver']){
            if (rels['betaver'].toUpperCase().startsWith('V'))
            {
                s1 = rels['betaver'];
                rels['betaver'] = s1.substring(1);
            }
        }
        if (rels['relver']){
            if (rels['relver'].toUpperCase().startsWith('V'))
            {
                s1 = rels['relver'];
                rels['relver'] = s1.substring(1);
            }
        }
        return rels;
    }
}


export {wtutils, wtconfig, dialog, github};