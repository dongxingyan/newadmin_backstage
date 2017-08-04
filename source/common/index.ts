import * as angular from 'angular';
let name = 'app.comon';
export default name;
export { name };
let dependences = [];
require.keys().filter(x => /^\.\/[^\/]+(\/index)?\.(js|ts)$/.test(x)).forEach(x => {
    let _m = require<any>(x);
    if (_m && _m.name)
        dependences.push(_m.name)
});
dependences = dependences.filter(x => x);
angular.module(name, dependences);