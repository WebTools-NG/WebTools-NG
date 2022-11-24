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

    getFirstEntry(){  // Get first entry in the queue
        this.item = this.queue[0];
    }

    removeFirstEntry(){ //Remove first entry from the queue
        this.queue.shift();
        wtconfig.set('Download.Queue', this.queue);
    }

    formatBytes(bytes, decimals = 2) {
        if (!+bytes) return '0 Bytes'
    
        const k = 1024
        const dm = decimals < 0 ? 0 : decimals
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    
        const i = Math.floor(Math.log(bytes) / Math.log(k))
    
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
    }

    async downloadItem(){ // Download the actual item
        log.info(`[Download.js] (downloadItem) Started download of file: ${this.item.targetFile}`);
        let header = wtutils.PMSHeader;
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
                    //ipcRenderer.removeAllListeners('downloadError');
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
        })
    }

    async stopProcess(){ // Abort current download
        this.queueRunning = false;
        status.clearStatus();
        status.updateStatusMsg( status.RevMsgType.Status, i18n.t('Common.Status.Msg.Idle'));
        this.queueRunning = true;
        ipcRenderer.send('downloadMediaAbort');
    }

    async startProcess(){  // Start download Queue
        log.info(`[Download.js] (startProcess) - Starting the download Queue`);
        status.updateStatusMsg( status.RevMsgType.Status, i18n.t('Common.Status.Msg.Processing'));
        this.queueRunning = true;
        this.queue = wtconfig.get('Download.Queue');
        this.getFirstEntry();
        while (this.item && this.queueRunning){
            this.getFirstEntry();
            await this.getSrvInfo();
            await this.createOutDir();
            await this.downloadItem();

            if (!this.lastError){ // Remove from queue if no error
                this.removeFirstEntry();
                // Update timestamp for the queue
                store.commit("UPDATE_Queue");
            }
        }
        console.log('Ged 99-5 all done')
    }
}

export { download };