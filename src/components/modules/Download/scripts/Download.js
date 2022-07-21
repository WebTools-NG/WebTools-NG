// This file holds download functions and logic

const log = require('electron-log');
console.log = log.log;

import { wtconfig } from '../../General/wtutils';
import { ptv } from '../../General/plextv';


const download = new class DOWNLOAD {
    constructor() {
        this.item = null;
        this.srvAddr = null;
        this.accessToken = null;
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
      this.srvAddr = await ptv.checkServerConnect(allPMSSrv[idx]);
      console.log('Ged 56-9', this.srvAddr, this.accessToken)
    }

    getFirstEntry(){  // Get first entry in the queue
        this.item = wtconfig.get('Download.Queue')[0];
        console.log('Ged 11-3 iTem', JSON.stringify(this.item))
    }

    async startProcess(){  // Start download Queue
        log.info(`[Download.js] (startProcess) - Starting the download Queue`);
        this.getFirstEntry();
        await this.getSrvInfo();
        await this.createOutDir()
        console.log('Ged 99 all done')

    }
}

export { download };