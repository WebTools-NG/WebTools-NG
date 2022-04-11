// Expose select dvr backup dialog
contextBridge.exposeInMainWorld('electron', {
  openDialog: (method, config) => ipcRenderer.invoke('dialog', method, config)
});

console.log('Ged 14 Preload')