var def = JSON.parse(JSON.stringify(require('./definitions.json')));
const log = require('electron-log');

const et = new class ET {
    constructor() {                    
    }

    getRealLevelName(level, libType) {
        // First get the real name of the level, and not just the display name
        const levelName = def[libType]['levels'][level]
        log.debug('ET LevelName: ' + levelName)
        return levelName
    } 

    getLevelFields(level, libType) {
        // return fields in a level
        const out = []        
        const levels = def[libType]['level'][et.getRealLevelName(level, libType)]        
        Object.keys(levels).forEach(function(key) {            
            out.push(levels[key])
          });        
        return out
    }

    getLevels(libType) {
        // Returns an array of levels for a selected type og medias, like 'movie'
        const levels = def[libType]['levels']
        log.debug('ET LevelNames: ' + JSON.stringify(levels))
        return levels
    }

    getLevelKeys(libType){
        // Only return the keys for possible levels
        const out = []
        const levels = def[libType]['levels']
        Object.keys(levels).forEach(function(key) {            
            out.push(key)
          });        
        return out        
    }
}

export {et};