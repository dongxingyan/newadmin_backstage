import angular = require("angular");
import IAttributes = angular.IAttributes;
import IRootElementService = angular.IRootElementService;
export let name = 'nut.bs.tooltip';

angular.module(name, [])
    .directive('tooltip', () => {
        return {
            link: function (scope, elem: IRootElementService, attrs: IAttributes) {
                let toId = -1;
                let firstTime = true;
                attrs.$observe<string>('tooltip', (expr) => {
                    scope.$watch(expr, function (value) {
                        if (firstTime) {
                            firstTime = false;
                            return;
                        }
                        clearTimeout(toId);
                        let duration = parseFloat(attrs['tooltipDuring']);
                        duration = isNaN(duration) ? 5000 : duration * 1000;

                        if (!!value) {
                            $(elem)['tooltip']({title: attrs['tooltipTitle'], placement: value, trigger: 'manual'});
                            $(elem)['tooltip']('show');
                            toId = setTimeout(function () {
                                $(elem)['tooltip']('hide');
                            }, duration)
                        } else {
                            $(elem)['tooltip']('hide');
                        }
                    });
                });
            }
        }
    });