// This file holds download functions and logic

const log = require('electron-log');
console.log = log.log;
const fs = require('fs');
const path = require('path');

const CancelToken = axios.CancelToken;





import { wtconfig, wtutils } from '../../General/wtutils';
import { ptv } from '../../General/plextv';
import axios from 'axios';
import * as stream from 'stream';

fs, path, stream, CancelToken

const download = new class DOWNLOAD {
    constructor() {
        this.item = null;
        //this.srvAddr = null;
        this.accessToken = null;
        this.queue = null;
        this.downloadProcent = 0;
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
        //this.item = null;
        this.item = this.queue[0];
//        this.accessToken = 
        console.log('Ged 11-3 item', JSON.stringify(this.item))
    }

    removeFirstEntry(){ //Remove first entry from the queue
        this.queue.shift();
        wtconfig.set('Download.Queue', this.queue);
        console.log('Ged 444-3 Queue now', this.queue)
    }

    async downloadItem(){ // Download the actual item
        log.info(`[Download.js] (downloadItem) Started download of file: ${this.item.targetFile}`);
        // Get the header
        let header = wtutils.PMSHeader;
        // Add Auth Token
        header['X-Plex-Token'] = this.accessToken;
        // Start by checking, if media is already partially downloaded
        let rangeStart = 0;
        const fs = require('fs');
        if (fs.existsSync(this.item.targetFile)) {
            console.log('Ged 12-3 exists Need to adjust start')
          }
        header['Content-Range'] = rangeStart;
        // Url to download
        const url = this.item.baseAddress + this.item.key + '?download=1';

        console.log('Ged 12-3 url', url)
        console.log('Ged 12-4 Header', JSON.stringify(header))
        this.downloadProcent = 0;

        console.log('Ged 88-3-0 Item', JSON.stringify(this.item))

        let downloadprocentlog = 1;
        let cancel;
        cancel;



        // item.targetFile
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
            }
        })
            .then((response) => {
                log.debug('[Download.js] (downloadItem) Response from downloadItem recieved');
                log.silly(`downloadItem returned as: ${JSON.stringify(response.data)}`);
            })
            .catch(function (error) {
            if (error.response) {
                log.error('[Download.js] (downloadItem) processWatchedList: ' + JSON.stringify(error.response.data));
                alert(error.response.data.errors[0].code + " " + error.response.data.errors[0].message);
            } else if (error.request) {
                log.error('[Download.js] (downloadItem) error: ' + error.request);
            } else {
                log.error('[Download.js] (downloadItem) last error: ' + error.message);
            }
        });


    }

    async startProcess(){  // Start download Queue
        log.info(`[Download.js] (startProcess) - Starting the download Queue`);

        this.queue = wtconfig.get('Download.Queue');
        this.getFirstEntry();
        console.log('Ged 99-3', JSON.stringify(this.queue))
        while (this.item){
            this.getFirstEntry();
            await this.getSrvInfo();
            await this.createOutDir();
            await this.downloadItem();

            //this.removeFirstEntry();
            console.log('Ged 99-4 Item Downloaded')

        }

        console.log('Ged 99-5 all done')
    }
}

export { download };