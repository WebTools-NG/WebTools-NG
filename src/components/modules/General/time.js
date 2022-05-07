// Time stuff used
import store from '../../../store';

const time = new class Time {

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
}

export { time };