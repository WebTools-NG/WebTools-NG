/* 
This file contains different functions and methods
that we use in our solution.
Can be used both from rendering and from main
 */

import axios from 'axios';

const qs = require('querystring')
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

    /* 
    This will move translation files in the app to userdata
    directory in a sub-folder named locales 
    It will only do so if this has not been done before or 
    this is a new version of our app
     */
    MoveToHome(SourceDir) {
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
            fs.readdir(SourceDir, function(err, items) {                  
                for (var i=0; i<items.length; i++) {                
                    var SourceFile = SourceDir + '/' + items[i];                
                    var TargetFile = TargetDir + '/' + items[i];
                    log.debug('Copying ' + SourceFile + ' to ' + TargetFile);
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

const poeditor = new class POEditor {
    constructor() {
        this.requestBody = {
            id: '342617',
            api_token: '5166c4294ff7fb3a82cbdc82958e850e'
          }

        this.config = {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            }
          }
    }
   

    get Translators() {
         var result = [];
         
         axios.post('https://api.poeditor.com/v2/contributors/list', qs.stringify(this.requestBody), this.config)
            .then((response) => {                                               
                var fresponse = response.data.result.contributors; 
                fresponse.forEach(element => {                 
                    result.push(element.name);
                    
                    log.verbose('Translator name: ' + element.name)
                    
                })
                
              })
            .then((fresponse) => {
                console.log('2nd then: ' + fresponse)
                return fresponse

            })

        console.log('Ged Result: ' + result)                             
        return result 
    } 
    

    get Languages() {
        var fresponse = null;
        axios.post('https://api.poeditor.com/v2/languages/list', qs.stringify(this.requestBody), this.config)
            .then((response) => {                
                console.log(response.data.result)  
                /* response.forEach(element => { 
                    console.log('Ged Navn: ' + element.name);
                }) */
                
                fresponse = response.data.result
              })        
        return fresponse

        /* {
            "name": "Danish",
            "code": "da",
            "translations": 39,
            "percentage": 68,
            "updated": "2020-06-03T22:24:11+0000"
        } */               
    }

    UpdateLang() {        
        poeditor.Languages.forEach(element => { 
            console.log('Ged Sprog: ' + element.name); 
          }); 
            
    }


}
export {wtutils, wtconfig, poeditor};