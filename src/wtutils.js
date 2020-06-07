/* 
This file contains different functions and methods
that we use in our solution.
Can be used both from rendering and from main
 */

const electron = require('electron');

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
  
    /* set name(value) {
      if (value.length < 4) {
        alert("Name is too short.");
        return;
      }
      this._name = value;
    } */
  
  }

// User Config 
const Store = require('electron-store');
const wtconfig = new Store({name: require('electron').remote.app.getName()});

  


export {wtutils, wtconfig};