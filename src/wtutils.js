/* 
This file contains different functions and methods
that we use in our solution.
Can be used both from rendering and from main
 */


const electron = require('electron');
// User Config 
const Store = require('electron-store');
const wtconfig = new Store({name: require('electron').remote.app.getName()});

const isMac = process.platform === 'darwin'
const isLinux = process.platform === 'linux'
const isWindows = process.platform === 'win32'

const wtutils = new class WTUtils {

    constructor() {      
    }
  
    get GetHome() {
      return (electron.app || electron.remote.app).getPath('userData');
    }

    get GetAppName() {
        return (electron.app || electron.remote.app).getName(); 
    }

    get GetAppVersion() {
        return (electron.app || electron.remote.app).getVersion(); 
    }


  
    MoveToHome(SourceDir) {
        var last = wtconfig.get('general.transfilescopied', "0")
        if (!(last == wtutils.GetAppVersion))
        {
            console.log('We need to copy translation strings over')            
            var fs = require('fs');
            // Check if userdata/locales exists, and create if not
            var TargetDir = wtutils.GetHome + '/locales';
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
            wtconfig.set('general.transfilescopied', wtutils.GetAppVersion)
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


  


export {wtutils, wtconfig, isLinux, isMac, isWindows};