/* 
This file contains different functions and methods
that we use in our solution.
Can be used both from rendering and from main
 */


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


  
    MoveToHome(SourceDir) {
        var last = wtconfig.get('general.transfilescopied', "0")
        if (!(last == wtutils.AppVersion))
        {
            console.log('We need to copy translation strings over')            
            var fs = require('fs');
            // Check if userdata/locales exists, and create if not
            var TargetDir = wtutils.Home + '/locales';
            if (!fs.existsSync(TargetDir)){
                fs.mkdirSync(TargetDir);
            }
            fs.readdir(SourceDir, function(err, items) {                  
                for (var i=0; i<items.length; i++) {                
                    var SourceFile = SourceDir + '/' + items[i];                
                    var TargetFile = TargetDir + '/' + items[i];
                    fs.copyFile(SourceFile, TargetFile, err => {  
                        if (err) return console.error(err)                        
                    });                  
                }                
            }); 
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


  


export {wtutils, wtconfig};