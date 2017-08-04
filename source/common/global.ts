import * as angular from 'angular';
export class Global {
    // API_PATH = 'https://api-dev.cloudp.cc/cloudpServer/';
    // IMG_API_PATH = 'https://api-dev.cloudp.cc';
    // PREVIEW_API_PATH = '118.144.248.18';
    // CHART_API_PATH = 'https://api-dev.cloudp.cc';
    API_PATH = 'https://api.cloudp.cc/cloudpServer/';
    IMG_API_PATH = 'https://api.cloudp.cc';
    CHART_API_PATH = 'https://api.cloudp.cc';
    // 预览地址前缀
    PREVIEW_API_PATH = 'http://on-line.cloudp.cc';
}
export let global = new Global();

export let name = 'app.global';
angular.module(name, [])
    .constant('Global', global);
