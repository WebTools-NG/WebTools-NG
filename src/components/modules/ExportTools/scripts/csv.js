// This file handles CSV exports

//import {wtconfig, wtutils} from '../../General/wtutils';
import {wtconfig} from '../../General/wtutils';
const log = require('electron-log');
console.log = log.log;



const csv = new class CSV {
    constructor() {
    }

    async addHeaderToTmp({ stream: stream, item: item})
    {
        const strHeader = item.join(wtconfig.get('ET.ColumnSep', ','));
        // Add the header
        await stream.write( strHeader + "\n");
        log.info(`Added CSV Header as: ${strHeader}`);
    }

    async addRowToTmp({ stream: stream, item: item})
    {
        await stream.write( item + "\n");
    }

}

export { csv };