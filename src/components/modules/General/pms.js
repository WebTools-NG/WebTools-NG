/*
This file contains functions etc used by WebTools-NG ExportTools
It's for PMS related functions only
*/


import {wtconfig} from '../General/wtutils';
import i18n from '../../../i18n';
import {et} from '../ExportTools/scripts/et'

const log = require('electron-log');
console.log = log.log;
const {JSONPath} = require('jsonpath-plus');

const pmsutils = new class PMSUtils {
    constructor() {
    }

    async getSectionData(){
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
            if (et.expSettings.libType == et.ETmediaType.Photo)
            {
                element = '/library/sections/' + et.expSettings.selLibKey + '/all';
                postURI = `?addedAt>>=-2208992400&X-Plex-Container-Start=${idx}&X-Plex-Container-Size=${step}&type=${et.expSettings.libTypeSec}&${et.uriParams}`;
            }
            else if (et.expSettings.libType == et.ETmediaType.Playlist)
            {
                element = '/playlists/' + et.expSettings.selLibKey;
                postURI = `/items?X-Plex-Container-Start=${idx}&X-Plex-Container-Size=${step}`;
            }
            else if (et.expSettings.libType == et.ETmediaType.Libraries)
            {
                element = '/library/sections/all';
                postURI = `?X-Plex-Container-Start=${idx}&X-Plex-Container-Size=${step}`;
            }
            else if (et.expSettings.libType == et.ETmediaType.Playlists)
            {
                element = '/playlists/all';
                postURI = `?X-Plex-Container-Start=${idx}&X-Plex-Container-Size=${step}`;
            }
            else
            {
                element = '/library/sections/' + et.expSettings.selLibKey + '/all';
                postURI = `?X-Plex-Container-Start=${idx}&X-Plex-Container-Size=${step}&type=${et.expSettings.libTypeSec}&${et.uriParams}`;
            }
            log.info(`Calling getSectionData url ${et.expSettings.baseURL + element + postURI}`);
            chuncks = await et.getItemData({baseURL: et.expSettings.baseURL, accessToken: et.expSettings.accessToken, element: element, postURI: postURI});
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
        return sectionData;
    }
}

export { pmsutils };