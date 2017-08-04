import {RemoteService} from './remote';
import {Global} from './global';
// import {StateProvider, StateService} from 'angular-ui-router/commonjs/ng1';
import * as router from 'angular-ui-router';
import {SessionService} from './session';
import * as angular from 'angular';

export let pageModules = [];
export interface IPageParams {
    // '#': string;
}
export interface IPageOptions {
    name?: string,
    template: any,
    requires?: string[],
    params?: string[],
    title?: string
}

export abstract class Page<T extends IPageParams> {
    protected abstract init(...args);

    pagetitle: string;

    constructor(public scope, public uiState: router.StateService, public params: T, public global: Global, public session: SessionService, public remote: RemoteService, ...args) {
        Promise.resolve().then(() => {
            this.pagetitle && (document.head.getElementsByTagName('title')[0].innerText = this.pagetitle);
            this.init && this.init(...args);
        });
    }
}

export function page(options: IPageOptions): Function {
    return function (constructor) {
        if (!options.name) {
            options.name = constructor.name.split('Page')[0].split(/(?=[A-Z])/).reduce((pv, nv) => pv + '.' + nv[0] + nv.slice(1)).toLowerCase();
        }
        if (!options.requires) {
            options.requires = [];
        }
        constructor.$inject = ['$scope', '$state', '$stateParams', 'Global', SessionService.name, RemoteService.name, ...options.requires];
        let name = 'app.pages.' + options.name;
        pageModules.push(name);
        let url = '/' + options.name.replace(/_\./g, '-').split('.').slice(-1)[0];
        if (options.params) {
            url += options.params.reduce((pv, nv, index) => {
                return pv + '/:' + nv;
            }, '')
        }
        let componentName = options.name.split(/\.|_|-/).filter(x => x).reduce((pv, nv, index) => {
            if (index != 0) {
                return pv + nv[0].toUpperCase() + nv.slice(1)
            } else {
                return pv + nv;
            }
        }, '');
        let stateName = options.name.replace(/_\./g, '-');
        angular.module(name, [])
            .component(componentName, {
                template: options.template,
                bindings: {pagetitle: '<'},
                controllerAs: 'vm',
                controller: constructor,
            })
            .config(['$stateProvider', function (state: router.StateProvider) {
                state.state(stateName, {
                    url: url,
                    component: componentName,
                    resolve: {
                        pagetitle: () => {
                            return options.title;
                        }
                    }
                });
                console.log('new route:', options.name, {
                    state: stateName,
                    url: url,
                    component: componentName
                })
            }])
    }
}