// jquery，会被angular和bootstrap用到，最优先引入
import './common/jquery-vendor';

// 修改了一些默认设置，所以不要引入node_modules下面的bootstrap v4
import './libs/bootstrap/scss/bootstrap.scss'
import 'bootstrap/dist/js/bootstrap'

import 'laydate/dist/laydate'
// 字体库
import 'font-awesome/scss/font-awesome'
import './libs/font/iconfont.css'

import * as angular from 'angular';
import * as router from 'angular-ui-router';
import 'angular-animate';
import 'angular-aria';
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

angular
    .module('app', ['ui.router', common, 'ngAnimate', 'ngAria', components.name].concat(pageModules))
    .run(['$interval', '$rootScope', 'SessionService', '$state', '$transitions', function (timer, rootScope, session: SessionService, state: router.StateService, $transitions: router.TransitionService) {
        rootScope.stateBar = () => {
            return {
                loading: rootScope.stateBar.state === 'loading',
                creating: rootScope.stateBar.state === 'creating',
                removing: rootScope.stateBar.state === 'removing',
            }
        };
        rootScope.stateBar.state = 'idle';
        // $transitions.onEnter(null, (t) => {
        //     let to = t.to();
        //     if (to.name !== 'login' && !session.token) {
        //         state.go('login');
        //     }
        // });

        timer(() => {

        }, 1000);
    }])
    .config(['$urlRouterProvider', function (url) {
        // 默认路由至login页面
        url.when('', 'login');
        // 错误路径，暂时也转向到login页面
        url.otherwise('login');
    }]);