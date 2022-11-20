// This file holds download functions and logic

const log = require('electron-log');
console.log = log.log;
const fs = require('fs');
const path = require('path');
//const stream = require('stream')
//const controller = new AbortController();




import {ipcRenderer} from 'electron';


import { wtconfig, wtutils } from '../../General/wtutils';
import { ptv } from '../../General/plextv';
import axios from 'axios';
//import * as stream from 'stream';

fs, path, axios

const download = new class DOWNLOAD {
    constructor() {
        this.item = null;
        //this.srvAddr = null;
        this.accessToken = null;
        this.queue = null;
        this.downloadProcent = 0;
        this.controller = null;
        this.queueRunning = false;
        this.queueChanged = false;
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
                    header: header
                })
            }
            catch (error)
            {
                log.error(`[Download.js] (downloadItem) downloading ${this.item.targetFile} cougth an exception as: ${error}`);
            }
            // Update progress
            ipcRenderer.on('downloadMediaProgress', (event, procent) => {
                log.info(`[Download.js] (downloadItem) - Downloaded file: ${this.item.targetFile}  completed ${procent} procent`);
                console.log('Ged 99-3 calculated procent', procent + Math.floor(procenttal))
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

    async downloadItem1(){ // Download the actual item
        log.info(`[Download.js] (downloadItem) Started download of file: ${this.item.targetFile}`);
        // Get the header
        console.log('Ged 1-3-3')
        let header = wtutils.PMSHeader;
        // Add Auth Token
        header['X-Plex-Token'] = this.accessToken;
        // Start by checking, if media is already partially downloaded
        let rangeStart = 0;
        // Make a stream writer
        let writer;
        writer;
        /* 
        let options = { 
            'flags': 'a',
            'encoding': null,
            'mode': '0666'
        } */

        console.log('Ged 1-3-4')
        console.log('Ged 1-3-4-2', this.item.targetFile)
        if (fs.existsSync(this.item.targetFile)) {
            console.log('Ged 12-3 exists Need to adjust start')
          } else {
            console.log('Ged 12-3-2 New file')
            //writer = stream.createWriteStream(this.item.targetFile);
            writer = fs.createWriteStream(this.item.targetFile);

           // writer = stream.createWriteStream(this.item.targetFile);
          }
        console.log('Ged 1-3-5')
        header['Content-Range'] = rangeStart;
        // Url to download
        const url = this.item.baseAddress + this.item.key + '?download=1';

        console.log('Ged 12-3 url', url)
        console.log('Ged 12-4 Header', JSON.stringify(header))
        this.downloadProcent = 0;

        console.log('Ged 88-3-0 Item', JSON.stringify(this.item))

        let downloadprocentlog = 1;

        downloadprocentlog;

        this.controller = new AbortController();
        this.lastError = null;




        // item.targetFile
       // const response = await axios({
        await axios({
            method: 'get',
            url: url,
            headers: header,
            responseType: 'stream',
            onDownloadProgress: progressEvent => {
                this.downloadProcent = Math.floor(progressEvent.loaded / progressEvent.total * 100);
                //console.log('Ged 88-3 url', url, 'completed: ', this.downloadProcent)
                if ( this.downloadProcent % 5 == 0) {
                    if (this.downloadProcent > downloadprocentlog){
                        log.info(`[Download.js] (downloadItem) Downloaded file ${this.item.targetFile} completed procent: ${this.downloadProcent}`);
                        downloadprocentlog = this.downloadProcent;
                    }
                }
            },
            signal: this.controller.signal
        })
        .then((response) => {
                response
                log.debug('[Download.js] (downloadItem) Response from downloadItem recieved');
                log.info(`[Download.js] (downloadItem) - Download completed for file: ${this.item.targetFile}`)
                //log.silly(`downloadItem returned as: ${JSON.stringify(response.data)}`);
                return new Promise((resolve, reject) => {
                    //writer.write(response.data);
                    response.data.pipe(writer);
                    let error = null;
                    writer.on('error', err => {
                      error = err;
                      writer.close();
                      reject(err);
                    });
                    writer.on('close', () => {
                        if (!error) {
                          resolve(true);
                        }
                        //no need to call the reject here, as it will have been called in the
                        //'error' stream;
                    });
                });
            })
            .catch(function (error) {
            if (error.code == 'ERR_CANCELED'){
                log.info(`[Download.js] (downloadItem) - User canceled download of file`);
                this.lastError = 'Canceled';
            }
            else if (error.response) {
                log.error('[Download.js] (downloadItem) processWatchedList: ' + JSON.stringify(error.response.data));
                alert(error.response.data.errors[0].code + " " + error.response.data.errors[0].message);
            } else if (error.request) {
                log.error('[Download.js] (downloadItem) error: ' + error.request);
            } else {
                log.error('[Download.js] (downloadItem) last error: ' + error.message);
            }
        });
    }

    async stopProcess(){ // Abort current download
        this.queueRunning = false;
        ipcRenderer.send('downloadMediaAbort');

        /* if (this.controller){
            this.controller.abort('Queue stopped');
        } */
    }

    async startProcess(){  // Start download Queue
        log.info(`[Download.js] (startProcess) - Starting the download Queue`);
        this.queueRunning = true;

        this.queue = wtconfig.get('Download.Queue');
        this.getFirstEntry();
        console.log('Ged 99-3', JSON.stringify(this.queue))
        while (this.item && this.queueRunning){
            this.getFirstEntry();
            await this.getSrvInfo();
            await this.createOutDir();
            await this.downloadItem();

            if (!this.lastError){ // Remove from queue if no error
                this.removeFirstEntry();
            }
            this.queueChanged = true;
            console.log('Ged 99-4 Item Downloaded')

        }

        console.log('Ged 99-5 all done')
    }
}

export { download };