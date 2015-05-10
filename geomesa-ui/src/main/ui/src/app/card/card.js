
angular.module('geomesa.card', [])

    .directive('cards', [function () {
        return {
            restrict: 'E',
            scope: {
                cards: '='
            },
            templateUrl: 'card/card.tpl.html',
            link: function (scope, element, attrs) {
                scope.$watch('cards', function (p) {
                    scope.selectedIndex = 0;
                });
                scope.updateIndex = function (i) {
                    scope.selectedIndex = Math.max(Math.min(scope.cards.length - 1, scope.selectedIndex + i), 0);
                };
                function success (response) {
                    console.log(response);
                }
                scope.$watch('selectedPoint', function (p) {
                    if (p && p.lat && p.lng) {
                        params = {
                            REQUEST: "GetFeatureInfo",
                            EXCEPTIONS: "application/vnd.ogc.se_xml",
                            BBOX: (p.lng - 0.5) + ',' + (p.lat + 0.5) + ',' + (p.lng + 0.5) + ',' + (p.lat - 0.5),
                            SERVICE: "WMS",
                            INFO_FORMAT: 'application/json',
                            QUERY_LAYERS: 'geomesa:QuickStart',
                            FEATURE_COUNT: 50,
                            Layers: 'geomesa:QuickStart',
                            HEIGHT: 300,
                            WIDTH: 300,
                            srs: 'EPSG:4326',
                            version: '1.1.1',
                            x: p.lng,
                            y: p.lat
                        };
                        WFSResource.wfsRequest(params).$promise.then(success);
                    }
                }, true);
            }
        };
    }])

    .directive('drag', function(){
        return {
            restrict: 'A',
            //The link function is responsible for registering DOM listeners as well as updating the DOM.
            link: function(scope, element, attrs, ctrl) {
              element.draggable({
                revert:false
              });
            }
        };
    });
