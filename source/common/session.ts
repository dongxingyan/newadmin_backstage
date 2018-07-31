import * as angular from 'angular';

export let name = 'app.session';
export class SessionService {
    get token() {
        return sessionStorage.getItem('token');
    }

    set token(value: string) {
        sessionStorage.setItem('token', value);
    }

    get userName(){
        return sessionStorage.getItem('userName');
    }

    set userName(value:string){
        sessionStorage.setItem('userName',value);
    }
    get orgId(){
        return sessionStorage.getItem('orgId')
    }
    set orgId(value: string){
        sessionStorage.setItem('orgId',value);
    }
    get accountId(){
        return sessionStorage.getItem('accountId')
    }
    set accountId(value: string){
        sessionStorage.setItem('accountId',value);
    }
    get userId(){
        return sessionStorage.getItem('userId')
    }
    set userId(value: string){
        sessionStorage.setItem('userId',value);
    }
    clear(){
        this.token = '';
        this.orgId='';
        this.accountId = '';
        this.userId = '';
    }
    constructor() {

    }
}

angular.module(name, [])
    .service('SessionService', SessionService);
