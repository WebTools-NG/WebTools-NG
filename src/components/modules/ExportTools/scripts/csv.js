// This file handles CSV exports

//import {wtconfig, wtutils} from '../../General/wtutils';
import {wtconfig} from '../../General/wtutils';
const log = require('electron-log');
console.log = log.log;

const {JSONPath} = require('jsonpath-plus');



const csv = new class CSV {
    constructor() {
    }

    async addJSONRowToTmp({ stream: stream, item: item})
    {
        let arrRow = [];
        for(const row of item) {
            let value = JSONPath({path: '$..value', json: row})[0];
            if ( JSONPath({path: '$..type', json: row})[0] === 'string'){
                value = `${wtconfig.get("ET.TextQualifierCSV", '"')}${value}${wtconfig.get("ET.TextQualifierCSV", '"')}`
            }
            if ( JSONPath({path: '$..subType', json: row})[0] === 'string'){
                value = `${wtconfig.get("ET.TextQualifierCSV", '"')}${value}${wtconfig.get("ET.TextQualifierCSV", '"')}`
            }
            arrRow.push(value);
        }
        const line = arrRow.join( wtconfig.get("ET.ColumnSep", '|'));
        await stream.write( line + "\n");
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