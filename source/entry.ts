// jquery，会被angular和bootstrap用到，最优先引入
// import './common/jquery-vendor';

// 修改了一些默认设置，所以不要引入node_modules下面的bootstrap v4
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap'

// 字体库
import 'font-awesome/scss/font-awesome'
import './libs/font/iconfont.css'

import * as angular from 'angular';
import * as router from 'angular-ui-router';
import 'angular-translate/dist/angular-translate.min.js';
import 'angular-translate/dist/angular-translate-loader-static-files/angular-translate-loader-static-files.js';
import 'angular-animate';
import 'angular-aria';
import 'angular-ui-bootstrap';
import 'angular-ui-bootstrap/dist/ui-bootstrap-tpls.js';
import 'angular-drag-and-drop-lists';
// 页面模块的模块名数组，与@page({...})装饰器的实现有关
import { pageModules } from './common/page';

// 通用服务
import common from './common';
// 页面
import './pages';
// 全局样式
import './style.styl';
// 组件
import * as components from './components'
import { SessionService } from "./common/session";

// 引入language文件
let chinese = require('language/cn-cn.json');
let english = require('language/en-us.json');

angular
    .module('app', ['dndLists', 'ui.router', 'pascalprecht.translate', common, 'ngAnimate', 'ngAria', 'ui.bootstrap', components.name,'ngFileUpload'].concat(pageModules))
    .run(['$interval', '$rootScope', 'SessionService', '$state', '$transitions',
        function (timer, rootScope, session: SessionService, state: router.StateService, $transitions: router.TransitionService) {
        rootScope.stateBar = () => {
            return {
                loading: rootScope.stateBar.state === 'loading',
                creating: rootScope.stateBar.state === 'creating',
                removing: rootScope.stateBar.state === 'removing',
            }
        };
    }])
    .filter('formatTimeFilter', function () {
        return function (UTCTime) {
            // 获取当前时区差值
            var formatTimeString = new Date(UTCTime),
                year = formatTimeString.getFullYear().toString(),
                month = (formatTimeString.getMonth() + 1).toString(),
                date = formatTimeString.getDate().toString(),
                hours = formatTimeString.getHours().toString(),
                minutes = formatTimeString.getMinutes().toString(),
                seconds = formatTimeString.getSeconds().toString();

            // 格式化每个日期节点的个数
            if (month.length === 1) month = '0' + month;
            if (date.length === 1) date = '0' + date;
            if (hours.length === 1) hours = '0' + hours;
            if (minutes.length === 1) minutes = '0' + minutes;
            if (seconds.length === 1) seconds = '0' + seconds;

            // 拼接称最终返回的时间
            return year + '-' + month + '-' + date + ' ' + hours + ':' + minutes + ':' + seconds;
        }
    })
    .config(['$urlRouterProvider', function (url) {
        // 默认路由至login页面
        url.when('', 'login');
        // 错误路径，暂时也转向到login页面
        url.otherwise('login');
    }])
    .config(['$qProvider', function ($qProvider) {
        $qProvider.errorOnUnhandledRejections(false);
    }])
    .config(['$translateProvider',function($translateProvider){
        let
            langFromLocal     = localStorage.getItem('lang') ?  localStorage.getItem('lang').toLowerCase() : '',
            langFromNavigator = navigator.language.toLowerCase(),
            lang              = '';

        if (langFromLocal) {
            lang = langFromLocal;
        } else {
            lang = langFromNavigator;
            localStorage.setItem('lang', lang);
        }

        lang = lang.indexOf('cn') > -1 ? 'cn-cn' : 'en-us';

        $translateProvider.translations('en-us',english);
        $translateProvider.translations('cn-cn',chinese);

        $translateProvider.useSanitizeValueStrategy('escaped');
        $translateProvider.fallbackLanguage(lang);
        $translateProvider.preferredLanguage(lang);
}])
