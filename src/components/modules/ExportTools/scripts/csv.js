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
        // Walk each item, and add Qualifier
        let headerArray = [];
        let x = 0;
        for (x=0; x<item.length; x++) {
            headerArray.push(wtconfig.get('ET.TextQualifierCSV', "\"") + item[x] + wtconfig.get('ET.TextQualifierCSV', "\""));
        }
        const strHeader = headerArray.join(wtconfig.get('ET.ColumnSep', ','));
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