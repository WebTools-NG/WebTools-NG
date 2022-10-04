// Time stuff used
import store from '../../../store';
import { wtconfig } from './wtutils';

const log = require('electron-log');



const time = new class Time {

    constructor() {
        // Below list came from: https://www.andiamo.co.uk/resources/iso-language-codes/
        this.countries = [
            { "text": "Unset (ISO)", "value": "UNSET"},
            { "text": "Afrikaans", "value": "af"},
            { "text": "Albanian", "value": "sq"},
            { "text": "Arabic (Algeria)", "value": "ar-dz"},
            { "text": "Arabic (Bahrain)", "value": "ar-bh"},
            { "text": "Arabic (Egypt)", "value": "ar-eg"},
            { "text": "Arabic (Iraq)", "value": "ar-iq"},
            { "text": "Arabic (Jordan)", "value": "ar-jo"},
            { "text": "Arabic (Kuwait)", "value": "ar-kw"},
            { "text": "Arabic (Lebanon)", "value": "ar-lb"},
            { "text": "Arabic (Libya)", "value": "ar-ly"},
            { "text": "Arabic (Morocco)", "value": "ar-ma"},
            { "text": "Arabic (Oman)", "value": "ar-om"},
            { "text": "Arabic (Qatar)", "value": "ar-qa"},
            { "text": "Arabic (Saudi Arabia)", "value": "ar-sa"},
            { "text": "Arabic (Syria)", "value": "ar-sy"},
            { "text": "Arabic (Tunisia)", "value": "ar-tn"},
            { "text": "Arabic (U.A.E.)", "value": "ar-ae"},
            { "text": "Arabic (Yemen)", "value": "ar-ye"},
            { "text": "Basque", "value": "eu"},
            { "text": "Belarusian", "value": "be"},
            { "text": "Bulgarian", "value": "bg"},
            { "text": "Catalan", "value": "ca"},
            { "text": "Chinese (Hong Kong)", "value": "zh-hk"},
            { "text": "Chinese (PRC)", "value": "zh-cn"},
            { "text": "Chinese (Singapore)", "value": "zh-sg"},
            { "text": "Chinese (Taiwan)", "value": "zh-tw"},
            { "text": "Croatian", "value": "hr"},
            { "text": "Czech", "value": "cs"},
            { "text": "Danish", "value": "da"},
            { "text": "Dutch (Belgium)", "value": "nl-be"},
            { "text": "Dutch (Standard)", "value": "nl"},
            { "text": "English", "value": "en"},
            { "text": "English (Australia)", "value": "en-au"},
            { "text": "English (Belize)", "value": "en-bz"},
            { "text": "English (Canada)", "value": "en-ca"},
            { "text": "English (Ireland)", "value": "en-ie"},
            { "text": "English (Jamaica)", "value": "en-jm"},
            { "text": "English (New Zealand)", "value": "en-nz"},
            { "text": "English (South Africa)", "value": "en-za"},
            { "text": "English (Trinidad)", "value": "en-tt"},
            { "text": "English (United Kingdom)", "value": "en-gb"},
            { "text": "English (United States)", "value": "en-us"},
            { "text": "Estonian", "value": "et"},
            { "text": "Faeroese", "value": "fo"},
            { "text": "Farsi", "value": "fa"},
            { "text": "Finnish", "value": "fi"},
            { "text": "French (Belgium)", "value": "fr-be"},
            { "text": "French (Canada)", "value": "fr-ca"},
            { "text": "French (Luxembourg)", "value": "fr-lu"},
            { "text": "French (Standard)", "value": "fr"},
            { "text": "French (Switzerland)", "value": "fr-ch"},
            { "text": "Gaelic (Scotland)", "value": "gd"},
            { "text": "German (Austria)", "value": "de-at"},
            { "text": "German (Liechtenstein)", "value": "de-li"},
            { "text": "German (Luxembourg)", "value": "de-lu"},
            { "text": "German (Standard)", "value": "de"},
            { "text": "German (Switzerland)", "value": "de-ch"},
            { "text": "Greek", "value": "el"},
            { "text": "Hebrew", "value": "he"},
            { "text": "Hindi", "value": "hi"},
            { "text": "Hungarian", "value": "hu"},
            { "text": "Icelandic", "value": "is"},
            { "text": "Indonesian", "value": "id"},
            { "text": "Irish", "value": "ga"},
            { "text": "Italian (Standard)", "value": "it"},
            { "text": "Italian (Switzerland)", "value": "it-ch"},
            { "text": "Japanese", "value": "ja"},
            { "text": "Korean", "value": "ko"},
            { "text": "Korean (Johab)", "value": "ko"},
            { "text": "Kurdish", "value": "ku"},
            { "text": "Latvian", "value": "lv"},
            { "text": "Lithuanian", "value": "lt"},
            { "text": "Macedonian (FYROM)", "value": "mk"},
            { "text": "Malayalam", "value": "ml"},
            { "text": "Malaysian", "value": "ms"},
            { "text": "Maltese", "value": "mt"},
            { "text": "Norwegian", "value": "no"},
            { "text": "Norwegian (Bokmål)", "value": "nb"},
            { "text": "Norwegian (Nynorsk)", "value": "nn"},
            { "text": "Polish", "value": "pl"},
            { "text": "Portuguese (Brazil)", "value": "pt-br"},
            { "text": "Portuguese (Portugal)", "value": "pt"},
            { "text": "Punjabi", "value": "pa"},
            { "text": "Rhaeto-Romanic", "value": "rm"},
            { "text": "Romanian", "value": "ro"},
            { "text": "Romanian (Republic of Moldova)", "value": "ro-md"},
            { "text": "Russian", "value": "ru"},
            { "text": "Russian (Republic of Moldova)", "value": "ru-md"},
            { "text": "Serbian", "value": "sr"},
            { "text": "Slovak", "value": "sk"},
            { "text": "Slovenian", "value": "sl"},
            { "text": "Sorbian", "value": "sb"},
            { "text": "Spanish (Argentina)", "value": "es-ar"},
            { "text": "Spanish (Bolivia)", "value": "es-bo"},
            { "text": "Spanish (Chile)", "value": "es-cl"},
            { "text": "Spanish (Colombia)", "value": "es-co"},
            { "text": "Spanish (Costa Rica)", "value": "es-cr"},
            { "text": "Spanish (Dominican Republic)", "value": "es-do"},
            { "text": "Spanish (Ecuador)", "value": "es-ec"},
            { "text": "Spanish (El Salvador)", "value": "es-sv"},
            { "text": "Spanish (Guatemala)", "value": "es-gt"},
            { "text": "Spanish (Honduras)", "value": "es-hn"},
            { "text": "Spanish (Mexico)", "value": "es-mx"},
            { "text": "Spanish (Nicaragua)", "value": "es-ni"},
            { "text": "Spanish (Panama)", "value": "es-pa"},
            { "text": "Spanish (Paraguay)", "value": "es-py"},
            { "text": "Spanish (Peru)", "value": "es-pe"},
            { "text": "Spanish (Puerto Rico)", "value": "es-pr"},
            { "text": "Spanish (Spain)", "value": "es"},
            { "text": "Spanish (Uruguay)", "value": "es-uy"},
            { "text": "Spanish (Venezuela)", "value": "es-ve"},
            { "text": "Swedish", "value": "sv"},
            { "text": "Swedish (Finland)", "value": "sv-fi"},
            { "text": "Thai", "value": "th"},
            { "text": "Tsonga", "value": "ts"},
            { "text": "Tswana", "value": "tn"},
            { "text": "Turkish", "value": "tr"},
            { "text": "Ukrainian", "value": "ua"},
            { "text": "Urdu", "value": "ur"},
            { "text": "Venda", "value": "ve"},
            { "text": "Vietnamese", "value": "vi"},
            { "text": "Welsh", "value": "cy"},
            { "text": "Xhosa", "value": "xh"},
            { "text": "Yiddish", "value": "ji"},
            { "text": "Zulu", "value": "zu"}
        ],
        this.options = {
            dateStyle: 'short',
            timeStyle: 'full',
            hour12: true,
            day: 'numeric',
            month: 'numeric',
            year: '2-digit',
            minute: '2-digit',
            second: '2-digit',
         };
    }

    async convertToLocalDateTime( datetime ){
        const localFormat = wtconfig.get('General.DateTimeFormat', 'NOTSET');
        if ( localFormat === 'NOTSET'){
            log.debug(`DateTimeFormat not set`);
            return datetime;
        }
        else {
            const options = { dateStyle: wtconfig.get('General.DateOption'), timeStyle: wtconfig.get('General.TimeOption') };
            console.log(new Intl.DateTimeFormat(localFormat, options).format(datetime));
            return new Intl.DateTimeFormat(localFormat, options).format(datetime);
        }
    }

    async convertToLocalTime( time ){
        const localFormat = wtconfig.get('General.DateTimeFormat', 'NOTSET');
        if ( localFormat === 'NOTSET'){
            log.debug(`[time.js] (convertToLocalTime) DateTimeFormat not set`);
            return time;
        }
        else {
            return new Intl.DateTimeFormat(localFormat, {
                hour: 'numeric',
                minute: 'numeric',
                second: 'numeric'
              }).format(time);
        }
    }

    async getStartTimeLocal(){
        const startTime = await store.getters.getStartTime;
        return await this.convertToLocalTime(startTime);
    }

    async getEndTimeLocal(){
        const endTime = await store.getters.getEndTime;
        return await this.convertToLocalTime(endTime);
    }

    async padTo2Digits(num) {
        return num.toString().padStart(2, '0');
    }

    async setStartTime(){
        store.commit('UPDATE_startTime', new Date());
    }

    async getStartTime(){
        const startTime = await store.getters.getStartTime;
        return `${await this.padTo2Digits(startTime.getHours())}:${await this.padTo2Digits(startTime.getMinutes())}:${await this.padTo2Digits(startTime.getSeconds())}`;
    }

    async setEndTime(){
        store.commit('UPDATE_endTime', new Date());
    }

    async getEndTime(){
        const endTime = await store.getters.getEndTime;
        return `${await this.padTo2Digits(endTime.getHours())}:${await this.padTo2Digits(endTime.getMinutes())}:${await this.padTo2Digits(endTime.getSeconds())}`;
    }

    async getTimeElapsed(){
        const startTime = await store.getters.getStartTime;
        const diffInMilliseconds = new Date() - startTime;
        const seconds = Math.floor((diffInMilliseconds / 1000) % 60);
        const minutes = Math.floor((diffInMilliseconds / (1000 * 60)) % 60);
        const hours = Math.floor((diffInMilliseconds / (1000 * 60 * 60)) % 24);
        return `${await this.padTo2Digits(hours)}:${await this.padTo2Digits(minutes)}:${await this.padTo2Digits(seconds)}`;
    }

    async getTimeDifStartEnd(){
        const startTime = await store.getters.getStartTime;
        const endTime = await store.getters.getEndTime;
        const diffInMilliseconds = endTime - startTime;
        const seconds = Math.floor((diffInMilliseconds / 1000) % 60);
        const minutes = Math.floor((diffInMilliseconds / (1000 * 60)) % 60);
        const hours = Math.floor((diffInMilliseconds / (1000 * 60 * 60)) % 24);
        return `${await this.padTo2Digits(hours)}:${await this.padTo2Digits(minutes)}:${await this.padTo2Digits(seconds)}`;
    }

    async convertMsToTime(milliseconds) {
        let seconds = Math.floor(milliseconds / 1000);
        let minutes = Math.floor(seconds / 60);
        let hours = Math.floor(minutes / 60);
        seconds = seconds % 60;
        minutes = minutes % 60;
        hours = hours % 24;
        return `${await this.padTo2Digits(hours)}:${await this.padTo2Digits(minutes)}:${await this.padTo2Digits(
          seconds,
        )}`;
    }

    async convertMsToDateTime(milliseconds) {
        // Create a new JavaScript Date object based on the timestamp
        // multiplied by 1000 so that the argument is in milliseconds, not seconds.
        let date, year, month, day, hours, minutes, seconds, result;
        date = new Date(milliseconds * 1000);
        year = date.getFullYear().toString();
        month = await this.padTo2Digits(date.getMonth().toString());
        day = await this.padTo2Digits(date.getDate().toString());
        hours = await this.padTo2Digits(date.getHours());
        minutes = await this.padTo2Digits(date.getMinutes());
        seconds = await this.padTo2Digits(date.getSeconds());
        result = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
        return result;
    }


}

export { time };