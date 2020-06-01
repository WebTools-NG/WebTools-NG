'use strict'

const log = require('electron-log');
import { app, protocol, BrowserWindow, Menu } from 'electron'
import {
  createProtocol,
  /* installVueDevtools */
} from 'vue-cli-plugin-electron-builder/lib'
import i18n from './i18n'
const isDevelopment = process.env.NODE_ENV !== 'production'

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([{scheme: 'app', privileges: { secure: true, standard: true } }])

function createWindow () {
  // Create the browser window.
  win = new BrowserWindow({ width: 1024, height: 768, webPreferences: {
    nodeIntegration: true
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
    // Install Vue Devtools
    // Devtools extensions are broken in Electron 6.0.0 and greater
    // See https://github.com/nklayman/vue-cli-plugin-electron-builder/issues/378 for more info
    // Electron will not launch with Devtools extensions installed on Windows 10 with dark mode
    // If you are not using Windows 10 dark mode, you may uncomment these lines
    // In addition, if the linked issue is closed, you can upgrade electron and uncomment these lines
    // try {
    //   await installVueDevtools()
    // } catch (e) {
    //   console.error('Vue Devtools failed to install:', e.toString())
    // }

  }
  createWindow()

  log.debug('Building custom menu')
  
  // Menu template
  const menuTemplate = [
    {
      // File menu
      label: i18n.t("Common.Menu.File.menuFile"),      
      submenu:
      [
        {
          label: i18n.t("Common.Menu.File.menuOpenLogDir")
          // TODO: Add Action
        },
        {
          label: i18n.t("Common.Menu.File.menuQuit"),
          role: 'quit'
        }
      ]
    },
    {
      // Edit menu
      label: i18n.t("Common.Menu.Edit.menuEdit"),
      submenu:
      [
        {
          label: i18n.t("Common.Menu.Edit.menuUndo"),
          role: 'undo'
        },
        {
          label: i18n.t("Common.Menu.Edit.menuRedo"),
          role: 'redo'
        },
        {
          type: 'separator'          
        },
        {
          label: i18n.t("Common.Menu.Edit.menuCut"),
          role: 'cut'
        },
        {
          label: i18n.t("Common.Menu.Edit.menuCopy"),
          role: 'copy'
        },
        {
          label: i18n.t("Common.Menu.Edit.menuPaste"),
          role: 'paste'
        },
        {
          label: i18n.t("Common.Menu.Edit.menuDelete"),
          role: 'delete'
        },
        {
          label: i18n.t("Common.Menu.Edit.menuSelectAll"),
          role: 'selectAll'
        }
      ]
    },
    {
      // View Menu
      label: i18n.t("Common.Menu.View.menuView"),
      submenu:
      [
        {
          label: i18n.t("Common.Menu.View.menuReload"),
          role: 'reload'
        },
        {
          label: i18n.t("Common.Menu.View.menuForceReload"),
          role: 'forceReload'
        },
        {
          label: i18n.t("Common.Menu.View.menuToggleDeveloperTools"),
          role: 'toggleDevTools'
        },
        {
          type: 'separator'          
        },
        {
          label: i18n.t("Common.Menu.View.menuActualSize"),
          role: 'resetZoom'
        },
        {
          label: i18n.t("Common.Menu.View.menuZoomIn"),
          role: 'zoomIn'
        },
        {
          label: i18n.t("Common.Menu.View.menuZoomOut"),
          role: 'zoomOut'
        },
        {
          label: i18n.t("Common.Menu.View.menuToggleFullScreen"),
          role: 'togglefullscreen'
        }
      ]
    },
    {
      // About Menu
      label: i18n.t("Common.Menu.About.menuAbout"),
      submenu:
      [
        {
          label: i18n.t("Common.Menu.About.menuAbout"),
          click() {
            BrowserWindow.loadURL('/about')
          }
          // TODO: Add action
        }
      ]
    }
  ]

  const menu = Menu.buildFromTemplate(menuTemplate)
  Menu.setApplicationMenu(menu)

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
