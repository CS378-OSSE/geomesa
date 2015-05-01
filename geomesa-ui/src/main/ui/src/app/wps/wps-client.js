angular.module('geomesa.wps', [])

    .controller('WpsController', ['$scope', function($scope) {
        console.log("in wps controller");
        var client = new OpenLayers.WPSClient({
            servers: {
                geomesa: 'http://geomesa:8080/geoserver/wps'
            }
        });
        var unique = client.getProcess('geomesa', 'geomesa:Unique');
        unique.execute({
            inputs: {
                attribute: "When",
                filter: "why",
                histogram: 1,
                sort: "ASC",
                sortByCount: 0
            },
            success: function(outputs){
                console.log("in success, yayayayaya");
            }
        });
        unique.execute();
        
        console.log("leaving wps controller");
    }]);

//
//angular.module('geomesa.wps', [])
//
//    .controller('geomesaWps', ['$scope', function ($scope) {
//        client = new wps.client({
//            servers: {
//                geomesa: 'http://geomesa:8080/geoserver/wps'
//            }
//        });
//
//
//
//           //     var projection = ol.proj.get('EPSG:3857'),
//           //         extent = projection.getExtent(),
//           //         baseLayer = new ol.layer.Tile({
//           //             extent: extent,
//           //             source: new ol.source.MapQuest({layer: 'osm'})
//           //         }),
//           //         wmsSource = new ol.source.TileWMS({
//           //             url: 'http://geomesa:8080/geoserver/wps',
//           //             params: {LAYERS: 'QuickStart'}
//           //         }),
//           //             wmsLayer = new ol.layer.Tile({
//           //             extent: extent,
//           //             source: wmsSource
//           //         }),
//           //         olView = new ol.View({
//           //             // center: ol.proj.transform([37.41, 8.82], 'EPSG:4326', 'EPSG:3857'),
//           //             center:[-8554902.86746,-4592147.60759],
//           //             zoom : 4,
//           //             maxResolution : 40075016.68557849 / screen.width,
//           //         });
//
//           //     scope.map = new ol.Map({
//           //         target: element[0],
//           //         layers: [baseLayer, wmsLayer],
//           //         view: olView
//           //     });
//
//           //     scope.api = {
//           //         applyCQL: function (cql) {
//           //             console.log(cql);
//           //         }
//           //     };
//
//           //     scope.map.on('singleclick', function(evt) {
//           //         var viewResolution = olView.getResolution(),
//           //             url = wmsSource.getGetFeatureInfoUrl(
//           //                 evt.coordinate, viewResolution, 'EPSG:3857',
//           //                 {'INFO_FORMAT': 'application/json', FEATURE_COUNT: 50}
//           //         );
//           //         $http.get(url).success(function(data, status, headers, config) {
//           //             if (data.features.length){
//           //                 scope.selectedFeatures = data.features;
//           //             }
//           //         }).error(function(data, status, headers, config) {
//           //             console.log('Error getting data with getFeatureInfo.');
//           //         });
//           //     }); 
//            }
//        };
//    }]);
