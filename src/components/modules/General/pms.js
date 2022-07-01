/*
This file contains different functions and methods
that we use fo PMS.
 */

const log = require('electron-log');
console.log = log.log;
const {JSONPath} = require('jsonpath-plus');

import store from '../../../store';

const pms = new class PMS {
    constructor() {
    }

    async getPMSSections( libTypes ){
        /*
            This function will return an array of libraries of specified types
            Param: libTypes   Like: ['movie', 'show']
        */
        await store.dispatch('fetchSections');
        const sections = await store.getters.getPmsSections;
        const result = [];
        this.selLib = "";
        if (Array.isArray(sections) && sections.length) {
          sections.forEach(req => {
              if ( libTypes.includes(req.type)){
                log.silly(`[pms.js] (getPMSSections) - pushing library: ${req.title} to results`);
                let item = [];
                let itemVal = {};
                itemVal['key'] = JSONPath({path: '$..key', json: req})[0];
                itemVal['location'] = JSONPath({path: '$..path', json: req.location});
                itemVal['type'] = JSONPath({path: '$..type', json: req})[0];
                item['text']=req.title;
                item['value']=itemVal;
                result.push(Object.assign({}, item));
              }
          });
        } else {
          log.error("[pms.js] (getPMSSections) - No Library found");
        }
        log.debug(`[pms.js] (getPMSSections) - reslut: ${JSON.stringify(result)}`);
        return result;
      }
}

export { pms };