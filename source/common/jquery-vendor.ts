declare let window: any, require;

let _$: JQueryStatic = require('../../node_modules/jquery/dist/jquery');
window.$ = window.jQuery = _$;

let tether = require('tether');
window.Tether = tether;

export default _$;