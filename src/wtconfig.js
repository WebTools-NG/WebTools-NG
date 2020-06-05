
const Store = require('electron-store');

const wtconfig = new Store({name: require('electron').remote.app.getName()});

module.exports = wtconfig;