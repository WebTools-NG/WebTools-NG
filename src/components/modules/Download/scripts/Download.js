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
        console.log('Ged 13-3 outDir', dirName)
    }

    async getSrvInfo(){  // Get download srv info
      // Get all servers
      let allPMSSrv = await ptv.getPMSServers( true );
      // Find idx of selected server
      let idx = allPMSSrv.map(function(x) {return x.clientIdentifier; }).indexOf(this.item['serverID']);
      this.accessToken = allPMSSrv[idx]['accessToken'];
      //this.srvAddr = await ptv.checkServerConnect(allPMSSrv[idx]);
      //this.srvAddr = await ptv.getValidPMSAddress( allPMSSrv[idx]['clientIdentifier'], allPMSSrv[idx]['connections'], this.accessToken)
      console.log('Ged 56-9 Token', this.accessToken)
    }

    getFirstEntry(){  // Get first entry in the queue
        this.item = this.queue[0];
    }

    removeFirstEntry(){ //Remove first entry from the queue
        this.queue.shift();
        wtconfig.set('Download.Queue', this.queue);
        console.log('Ged 444-3 Queue now', this.queue)
    }

    async downloadItem(){ // Download the actual item
        log.info(`[Download.js] (downloadItem) Started download of file: ${this.item.targetFile}`);
        console.log('Ged 23-3-0 status', JSON.stringify(store.getters.getStatus))
        console.log('Ged 23-3-0-1 status')
        console.log('Ged 23-3-1 status', status.RevMsgType.Info)

        console.log('Ged 23-3-2 status', JSON.stringify(store.getters.getStatus))


        let header = wtutils.PMSHeader;
        // Add Auth Token
        header['X-Plex-Token'] = this.accessToken;
        // Start by checking, if media is already partially downloaded
        let rangeStart = 0;
        let procenttal = 0;
        if (fs.existsSync(this.item.targetFile)) {
            console.log('Ged 12-3 exists Need to adjust start')
            var stats = fs.statSync(this.item.targetFile)
            rangeStart = stats.size;
            //header['Range'] = `bytes=${rangeStart}-${this.item.size}`;
            header['Range'] = `bytes=${rangeStart}-`;
            //"bytes=100-200"
            procenttal = Math.floor(Math.floor(rangeStart/this.item.size*100)/5)*5;
            console.log('Ged 12-3-1 procent done', rangeStart, '*', this.item.size, '*', Math.floor(procenttal))
            //let procenttal5 = Math.floor(Math.floor(procenttal)/5)*5
            //console.log('Ged 12-3-1-2 procent 5 done', procenttal5)
          } else {
            console.log('Ged 12-3-2 New file')
          }
        console.log('Ged 1-3-5')
        //header['Content-Range'] = rangeStart;
        //header['Range'] = `${rangeStart}-`;
        header['Accept'] = '*/*';
        // Url to download
        const url = this.item.baseAddress + this.item.key + '?download=1';

        console.log('Ged 12-3 url', url)
        console.log('Ged 12-4 Header', JSON.stringify(header))
        this.downloadProcent = 0;

        console.log('Ged 88-3-0 Item', JSON.stringify(this.item))

        status.updateStatusMsg( status.RevMsgType.Downloading, i18n.t('Common.Status.Msg.Downloading', { title: this.item.title }));

        let downloadprocentlog = 1;
        downloadprocentlog;
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
                log.info(`[Download.js] (downloadItem) - Downloaded file: ${this.item.targetFile}  completed ${data.Procent}%`);
                status.updateStatusMsg( status.RevMsgType.Downloaded, i18n.t('Common.Status.Msg.Downloaded', { current: data.Downloaded, total: data.Total, procent: data.Procent } ));


                console.log('Ged 99-3 data', JSON.stringify(data))
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