// Helper file for dvr.tv module
const log = require('electron-log');
console.log = log.log;


import {wtconfig, wtutils} from '../../General/wtutils';
import i18n from '../../../../i18n';
import store from '../../../../store';

i18n, wtconfig, wtutils, store

const dvr = new class DVR {
}