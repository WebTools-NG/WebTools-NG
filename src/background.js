'use strict'
import { app, protocol, BrowserWindow, Menu} from 'electron';
import { wtutils } from '../src/components/modules/General/wtutils';

const log = require('electron-log');
console.log = log.log;

// Sadly needs below, since part of main process, so not inherited
log.transports.file.fileName = wtutils.AppName;

import {
  createProtocol
} from 'vue-cli-plugin-electron-builder/lib'
//import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'

const isDevelopment = process.env.NODE_ENV !== 'production'

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
      console.log('VUE DevTools disabled for now')
    } catch (e) {
      console.error('Vue Devtools failed to install:', e.toString())
    }

  }
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
