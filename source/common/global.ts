import * as angular from 'angular';
export class Global {
    API_PATH = 'https://api-dev.cloudp.cc/cloudpServer/';
    API2_PATH = "....";
    IMG_API_PATH = 'https://api-dev.cloudp.cc';
    // 预览地址前缀
    PREVIEW_API_PATH = '118.144.248.18';
    // PREVIEW_API_PATH = 'www.cloudp.cc/live/';
}
export let global = new Global();

export let name = 'app.global';
angular.module(name, [])
    .constant('Global', global);
