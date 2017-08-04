import {global} from "../global";
import IHttpService = angular.IHttpService;

class ConnectionEnv {
    api_path = global.API_PATH;
    get token() {
        let token = sessionStorage.getItem('token');
        if (!token) {
            throw '尚未获得token.'
        }
        return token
    };
    constructor(public http: IHttpService) {
    }
}
export let env: ConnectionEnv = null;

export function initConnection($http) {
    env = new ConnectionEnv($http)
}

export interface Response<T> {
    code: string;
    data: T;
    mes: string;
}

export function before() {

}

export function after() {

}

export function error(reason: string) {

}


