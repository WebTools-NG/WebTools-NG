/*
This file contains functions etc used by WebTools-NG ExportTools
It's for PMS related functions only
*/


import {wtconfig, wtutils} from '../General/wtutils';
import i18n from '../../../i18n';
import {et} from '../ExportTools/scripts/et'
import axios from 'axios';

const log = require('electron-log');
console.log = log.log;
const {JSONPath} = require('jsonpath-plus');

const pmsutils = new class PMSUtils {
    constructor() {
        this.PMSHeader = wtutils.PMSHeader;
        this.defpostURI = '?checkFiles=1&includeRelated=0&includeExtras=1&includeBandwidths=1&includeChapters=1'
    }

    test(counter) {
        console.log(`Ged ${counter}`)
    }

    async getSectionData(){
        return await new Promise(function(resolve) {
            const sectionData = [];
            // Find LibType steps
            const step = wtconfig.get("PMS.ContainerSize." + et.expSettings.libType, 20);
            log.debug(`Got Step size as: ${step}`)
            let element;
            // Now read the fields and level defs
            // Current item
            let idx = 0;
            // Now let's walk the section
            let chuncks, postURI, size;
            do {
                switch(et.expSettings.libType) {
                    case et.ETmediaType.Photo:
                        element = '/library/sections/' + et.expSettings.selLibKey + '/all';
                        postURI = `?addedAt>>=-2208992400&X-Plex-Container-Start=${idx}&X-Plex-Container-Size=${step}&type=${et.expSettings.libTypeSec}&${et.uriParams}`;
                        break;
                    case et.ETmediaType.Playlist:
                        element = '/playlists/' + et.expSettings.selLibKey;
                        postURI = `/items?X-Plex-Container-Start=${idx}&X-Plex-Container-Size=${step}`;
                        break;
                    case et.ETmediaType.Libraries:
                        element = '/library/sections/all';
                        postURI = `?X-Plex-Container-Start=${idx}&X-Plex-Container-Size=${step}`;
                        break;
                    case et.ETmediaType.Playlists:
                        element = '/playlists/all';
                        postURI = `?X-Plex-Container-Start=${idx}&X-Plex-Container-Size=${step}`;
                        break;
                    default:
                        element = '/library/sections/' + et.expSettings.selLibKey + '/all';
                        postURI = `?X-Plex-Container-Start=${idx}&X-Plex-Container-Size=${step}&type=${et.expSettings.libTypeSec}&${et.uriParams}`;
                }

                log.info(`Calling getSectionData url ${et.expSettings.baseURL + element + postURI}`);
//                chuncks = await et.getItemData({baseURL: et.expSettings.baseURL, accessToken: et.expSettings.accessToken, element: element, postURI: postURI});
                chuncks = async () => {await pmsutils.getItemData({element: element, postURI: postURI})};
                //chuncks = async () => {await this.getItemData({element: element, postURI: postURI});};
                console.log('Ged 11 '+ JSON.stringify(chuncks))                
                size = JSONPath({path: '$.MediaContainer.size', json: chuncks});
                const totalSize = JSONPath({path: '$.MediaContainer.totalSize', json: chuncks});
                log.info(`getSectionData chunck size is ${size} and idx is ${idx} and totalsize is ${totalSize}`);
                et.updateStatusMsg(et.rawMsgType.Info, i18n.t('Modules.ET.Status.GetSectionItems', {chunck: step, totalSize: totalSize}));
                sectionData.push(chuncks);
                log.debug(`Pushed chunk as ${JSON.stringify(chuncks)}`);
                idx = idx + step;
            } while (size > 1);
            log.silly(`SectionData to return is:`);
            log.silly(JSON.stringify(sectionData));
            //return sectionData;

            resolve(sectionData);
        });        
    }

    getItemData({element, postURI=this.defpostURI})
    {
        console.log('Ged 12')
        return new Promise(function(resolve) {
            const url = et.expSettings.baseURL + element + postURI;
 
            this.PMSHeader["X-Plex-Token"] = et.expSettings.accessToken;
            log.verbose(`Calling url in getItemData: ${url}`)

/* 
            let response = await fetch(url, { method: 'GET', headers: this.PMSHeader});
            let resp = await response.json();
            log.silly(`Response in getItemData: ${JSON.stringify(resp)}`)
            console.log('Ged 13')
            resolve(resp)

 */
            const https = require('https');
            const agent = new https.Agent({
                rejectUnauthorized: false
            });

            axios({
                method: 'GET',
                url: url,
                responseType: 'stream',
                httpsAgent: agent,
                header: this.PMSHeader
            }).then((response) => {
                console.log('Ged 44', JSON.stringify(response.data));
                resolve(response.data)
                
                })
                
            }).catch((error) => {
                log.error(`Ged Gummiged 22: ${error}`);                
        });
        
    }        
    
}

export { pmsutils };