import * as tooltip from './bs-tooltip'
import angular = require("angular");
export let name = 'nuts';


let dependences = [];

require.keys().filter(x => /^\.\/[^\/]+(\/index)?\.(js|ts)$/.test(x)).forEach(x => {
    let _m = require<any>(x);
    if (_m && _m.name)
        dependences.push(_m.name)
});

angular.module(name, dependences);

