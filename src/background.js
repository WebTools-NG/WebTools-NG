'use strict'
import { app, protocol, BrowserWindow, Menu} from 'electron';
import { wtutils, wtconfig } from '../src/components/modules/General/wtutils';
import axios from 'axios';
import { AbortController } from "node-abort-controller";
//import { status } from '../src/components/modules/General/status';
//import i18n from '../src/i18n';

const log = require('electron-log');
console.log = log.log;
const { ipcMain, dialog } = require('electron');

// Sadly needs below, since part of main process, so not inherited
log.transports.file.fileName = wtutils.logFileName;

import {
  createProtocol
} from 'vue-cli-plugin-electron-builder/lib'
//import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'

const isDevelopment = process.env.NODE_ENV !== 'production'

// An abort Controller for downloads
let controller = null;
//let controller = new AbortController();
controller;

// Bad thing, but need to disable cert checks, since connecting via ip
// to a cert issued for plex.direct
app.commandLine.appendSwitch('ignore-certificate-errors', 'true');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([{scheme: 'app', privileges: { secure: true, standard: true } }])

function createWindow () {
  // Create the browser window.
  win = new BrowserWindow({ width: 1024, height: 768, icon: __dirname + "/../src/assets/WebTools-512.png", webPreferences: {
    nodeIntegration: true,
    contextIsolation: false,
    webSecurity: false,
    enableRemoteModule: true
  } })

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
    if (!process.env.IS_TEST) win.webContents.openDevTools({'mode': 'undocked'})
  } else {
    createProtocol('app')
    // Load the index.html when not in development
    win.loadURL('app://./index.html')
  }

  win.on('closed', () => {
    win = null
  })

  // Set proper title for main window
  win.webContents.on('did-finish-load', () => {
    let windowtitle = wtutils.AppName + " v" + wtutils.AppVersion;
    win.setTitle(windowtitle);
  })

}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

ipcMain.on('close-me', () => {
  log.info('I have been reset');
  app.quit()
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow()
  }
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    try {
      //await installExtension(VUEJS_DEVTOOLS)
      console.log('[background.js] (app.on) VUE DevTools disabled for now')
    } catch (e) {
      console.error('Vue Devtools failed to install:', e.toString())
    }
  }
  // Open system Dialog
  ipcMain.handle('dialog', (event, method, params) => {
    dialog[method](params);
  });
  Menu.setApplicationMenu(null)
  createWindow()
})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', data => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}

//const axios = require('axios');
const fs = require('fs');

ipcMain.on('downloadFile', function (event, data) {
  const filePath = data.filePath;
  const item = data.item;
  const https = require('https');
  const agent = new https.Agent({
    rejectUnauthorized: false
  });
  axios({
    method: 'GET',
    url: item,
    headers: data.header,
    responseType: 'stream',
    httpsAgent: agent
  }).then((response) => {
    response.data.pipe(fs.createWriteStream(filePath))
    response.data.on('end', () => {
      event.sender.send('downloadEnd');
    })
    response.data.on('error', (error) => {
      log.error(`background (downloadFile): Failed to download ${item.split('&X-Plex-Token=')[0]}`);
      event.sender.send('downloadError', error);
    })
  }).catch((error) => {
    log.error(`background (downloadFile): ${item.split('&X-Plex-Token=')[0]}`);
    event.sender.send('downloadError', error);
  })
})

ipcMain.on('downloadMediaAbort', function () {
  log.info(`[background.js] (downloadMediaAbort) - Aborting download`)
  if (controller){
    controller.abort('Queue stopped');
  }
})

ipcMain.on('downloadMedia', function (event, data) {
  const https = require('https');
  controller = null;
  const agent = new https.Agent({
    rejectUnauthorized: false
  });
  let targetStream;
  if ( data.header["Range"] == 0){
    targetStream = fs.createWriteStream(data.targetFile);
  } else {
    targetStream = fs.createWriteStream(data.targetFile, {flags:'a'});
  }

  let startbyte = 0;
  if (data.header["Range"]){
    startbyte = data.header["Range"].substring(6).slice(0, -1)
  }
  controller = new AbortController();
  const maxrateLimit = wtconfig.get("Download.DownloadMaxBandWidth", 7);


  axios({
    method: 'GET',
    url: data.url,
    headers: data.header,
    responseType: 'stream',
    httpsAgent: agent,
    signal: controller.signal,
    maxRate: [
      maxrateLimit * 1024 * 1024 , // upload limit,
      maxrateLimit * 1024 * 1024 // download limit
    ],
    onDownloadProgress: progressEvent => {
      const downloadData = {};
      downloadData['Downloaded'] =  progressEvent.loaded;
      downloadData['Total'] =  progressEvent.total;
      if ( data.size ){
        downloadData['Procent'] = Math.floor((Number(progressEvent.loaded) + Number(startbyte)) / Number(data.size) * 100);
      } else {
        downloadData['Procent'] = 100;
      }
      downloadData['startbyte'] =  startbyte;
      event.sender.send('downloadMediaProgress', downloadData);
  },
  }).then((response) => {
    log.info(`[background.js] (downloadMedia) - Download started`);
    response.data.pipe(targetStream);
    response.data.on('end', () => {
      targetStream.end();
      event.sender.send('downloadMediaEnd');
    })
    response.data.on('error', (error) => {
      targetStream.end();
      event.sender.send('downloadMediaError', error);
    })
  }).catch((error) => {
    log.error(`[background.js] (downloadFile) - ${error}`);
    targetStream.end();
    event.sender.send('downloadMediaError', error);
  })
})

