// This file holds download functions and logic

const log = require('electron-log');
console.log = log.log;
const fs = require('fs');
const path = require('path');

import {ipcRenderer} from 'electron';
import { wtconfig, wtutils } from '../../General/wtutils';
import { ptv } from '../../General/plextv';
import axios from 'axios';
import i18n from '../../../../i18n';
import store from '../../../../store';
import { status } from '../../General/status';

path, axios

const download = new class DOWNLOAD {
    constructor() {
        this.item = null;
        //this.srvAddr = null;
        this.accessToken = null;
        this.queue = null;
        this.downloadProcent = 0;
        this.controller = null;
        this.queueRunning = false;
        this.lastError = null;
        this.downloadError = false;
        this.queueCount = 0;
        this.lastErrMsg = ""
    }

    async createOutDir(){  // Force create OutDir
        var path = require('path');
        var fs = require('fs');
        const dirName = path.dirname( this.item['targetFile'])
        try {
            if (!fs.existsSync(dirName)) {
              fs.mkdirSync(dirName, { recursive: true });
            }
        } catch (err) {
            log.error(`[download.js] (createOutDir) - err`)
        }
    }

    async getSrvInfo(){  // Get download srv info
      // Get all servers
      let allPMSSrv = await ptv.getPMSServers( true );
      // Find idx of selected server
      let idx = allPMSSrv.map(function(x) {return x.clientIdentifier; }).indexOf(this.item['serverID']);
      this.accessToken = allPMSSrv[idx]['accessToken'];
    }

    GEDgetFirstEntry(){  // Get first entry in the queue
        this.item = this.queue[0];
    }

    removeFirstEntry(){ //Remove first entry from the queue
        this.queue.shift();
        wtconfig.set('Download.Queue', this.queue);
    }

    getNextEntry(){  // Get first entry in the queue
        this.item = this.queue[this.queueCount];
    }

    formatBytes(bytes, decimals = 2) {
        if (!+bytes) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
    }

    async downloadItem(){ // Download the actual item
        log.info(`[Download.js] (downloadItem) Started download of file: ${this.item.targetFile}`);
        let header = wtutils.PMSHeader;
        this.downloadError = false;
        // Add Auth Token
        header['X-Plex-Token'] = this.accessToken;
        // Start by checking, if media is already partially downloaded
        let rangeStart = 0;
        //let procenttal = 0;
        if (fs.existsSync(this.item.targetFile)) {
            var stats = fs.statSync(this.item.targetFile)
            rangeStart = stats.size;
            log.info(`[Download.js] (downloadItem) - Resuming download from ${rangeStart}`);
            //header['Range'] = `bytes=${rangeStart}-${this.item.size}`;
            header['Range'] = `bytes=${rangeStart}-`;
          }

        let procentlog = 0;
        header['Accept'] = '*/*';
        // Url to download
        const url = this.item.baseAddress + this.item.key + '?download=1';
        this.downloadProcent = 0;
        status.updateStatusMsg( status.RevMsgType.Downloading, i18n.t('Common.Status.Msg.Downloading', { title: this.item.title }));
        this.controller = new AbortController();
        this.lastError = null;
        const _this = this;
        return new Promise((resolve) => {
            try
            {
                _this.isDownloading = true;
                ipcRenderer.send('downloadMedia', {
                    url: url,
                    targetFile: this.item.targetFile,
                    header: header,
                    size: this.item.size
                })
            }
            catch (error)
            {
                log.error(`[Download.js] (downloadItem) downloading ${this.item.targetFile} cougth an exception as: ${error}`);
            }
            // Update progress
            ipcRenderer.on('downloadMediaProgress', (event, data) => {
                if ( Number(data.Procent) % 5 == 0) {
                    if ( procentlog < Number(data.Procent)){
                        log.info(`[Download.js] (downloadItem) - Downloaded file: ${this.item.targetFile}  completed ${data.Procent}%`);
                        procentlog = Number(data.Procent);
                    }
                  }
                //log.info(`[Download.js] (downloadItem) - Downloaded file: ${this.item.targetFile}  completed ${data.Procent}%`);
                const download = `${data.Downloaded} (${this.formatBytes(data.Downloaded)})`;
                const total = `${data.Total} (${this.formatBytes(data.Total)})`
                status.updateStatusMsg( status.RevMsgType.Downloaded, i18n.t('Common.Status.Msg.Downloaded', { current: download, total: total, procent: data.Procent } ));
            })
            ipcRenderer.on('downloadMediaEnd', () => {
                try
                {
                    log.info(`[Download.js] (downloadItem) - Download finished for ${this.item.targetFile} ok`);
                    ipcRenderer.removeAllListeners('downloadMediaEnd');
                    ipcRenderer.removeAllListeners('downloadMediaError');
                    ipcRenderer.removeAllListeners('downloadMediaProgress');
                    // Rename to real file name
                    const newFile = this.item.targetFile.replace('.tmp', '')
                    if (fs.existsSync(this.item.targetFile)) {
                        fs.renameSync(this.item.targetFile, newFile);
                    }
                    resolve(this.item.targetFile);
                }
                catch (error)
                {
                    log.error(`[Download.js] (downloadItem) - downloading "${this.item.title}" caused an exception as: ${error}`);
                }
            })
            ipcRenderer.on('downloadMediaError', (event, data) => {
                console.log('Ged 13 HELLO')
                this.downloadError = true;
                try
                {
                    log.error(`[Download.js] (downloadItem) - Download had an error for ${this.item.targetFile}`);
                    console.log('Ged 99-3', JSON.stringify(data))
                    this.lastErrMsg = JSON.stringify(data);
                    //log.error(`[Download.js] (downloadItem) - Error code ${this.item.targetFile}`);

                    ipcRenderer.removeAllListeners('downloadMediaEnd');
                    ipcRenderer.removeAllListeners('downloadMediaError');
                    ipcRenderer.removeAllListeners('downloadMediaProgress');
                    resolve(this.item.targetFile);
                }
                catch (error)
                {
                    log.error(`[Download.js] (downloadItem) - downloading "${this.item.title}" caused an exception as: ${error}`);
                }
            })
        })
    }

    async stopProcess(){ // Abort current download
        this.queueRunning = false;
        status.clearStatus();
        status.updateStatusMsg( status.RevMsgType.Status, i18n.t('Common.Status.Msg.Idle'));
        //this.queueRunning = true;
        store.commit("UPDATE_QueueStatus", false);
        ipcRenderer.send('downloadMediaAbort');
    }

    async startProcess(){  // Start download Queue
        log.info(`[Download.js] (startProcess) - Starting the download Queue`);
        store.commit("UPDATE_QueueStatus", true);
        status.updateStatusMsg( status.RevMsgType.Status, i18n.t('Common.Status.Msg.Processing'));
        this.queueRunning = true;
        this.queueCount = 0;
        this.queue = wtconfig.get('Download.Queue');
        this.getNextEntry();
        console.log('Ged 77-3', JSON.stringify(this.item), this.queueRunning)
        while (this.item && this.queueRunning){
            
            await this.getSrvInfo();
            await this.createOutDir();
            await this.downloadItem();
            console.log('Ged 15', this.downloadError, JSON.stringify(this.item))

            if (!this.downloadError){ // Remove from queue if no error
                this.removeFirstEntry();
                // Update timestamp for the queue
                store.commit("UPDATE_Queue");
            } else {
                // We had an error
                console.log('Ged 13-3 We had an error')
                let idx = 0;
                for (let item of this.queue) {
                    if (item.hash === this.item.hash) {
                        console.log('Ged 13-4 found item as', JSON.stringify(item), idx)
                        if (item.error) {
                            let error = {};
                            error = this.queue[idx]["error"];
                            error[Object.keys(error).length + 1] = this.lastErrMsg;
                            this.queue[idx]["error"] = error;
                            wtconfig.set("Download.Queue", this.queue);
                        } else {
                           let error = {};
                           error[1] = this.lastErrMsg;
                           this.queue[idx]["error"] = error;
                           wtconfig.set("Download.Queue", this.queue);

                        }
                        break;
                    }
                    idx += 1;
                }

                //let errCount = wtconfig.get("Download.")
            }
            this.queueCount += 1;
            this.getNextEntry();
        }
        this.queueRunning = false;
        store.commit("UPDATE_QueueStatus", false);
        log.info(`[Download.js] (startProcess) - Download completed`);
        status.clearStatus();
        status.updateStatusMsg(status.RevMsgType.Status, i18n.t('Common.Status.Msg.Idle'))
    }
}

export { download };