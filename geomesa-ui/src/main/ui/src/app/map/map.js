angular.module('geomesa.map', [])

    .directive('geomesaMap', [function () {
        return {
            restrict: 'E',
            scope: {
                map: '=?',
                api: '=',
                selectedPoint: '='
            },
           // link: function (scope, element, attrs) {
           //     //var baseLayer = L.tileLayer.provider('Stamen.TonerLite'),
           //     var baseLayer = L.tileLayer.provider('MapQuestOpen.OSM'), 
           //         wmsLayer = L.tileLayer.wms("http://geomesa:8080/geoserver/geomesa/wms", {
           //             layers: 'geomesa:QuickStart',
           //             format: 'image/png',
           //             transparent: true
           //         });

           //     scope.map = L.map(element[0], {
           //         center: L.latLng(-38.09, -76.85),
           //         zoom: 8,
           //         maxZoom: 18,
           //         minZoom: 3,
           //         attributionControl: false,
           //         layers: [baseLayer, wmsLayer]
           //     });

           //     scope.map.on('click', function (evt) {
           //         scope.$apply(function () {
           //             scope.selectedPoint = {
           //                 lat: evt.latlng.lat,
           //                 lng: evt.latlng.lng
           //             };
           //         });
           //     });

           //     scope.api = {
           //         applyCQL: function (cql) {
           //             console.log(cql);
           //         }
           //     };

           // }

            link: function (scope, element, attrs) {
               //var baseLayer = L.tileLayer.provider('Stamen.TonerLite'),
               // var baseLayer = L.tileLayer.provider('MapQuestOpen.OSM'), 
               //     wmsLayer = L.tileLayer.wms("http://geomesa:8080/geoserver/geomesa/wms", {
               //         layers: 'geomesa:QuickStart',
               //         format: 'image/png',
               //         transparent: true
               //     });

                 scope.map = new ol.Map({
                   target: element[0],
                   layers: [
                     new ol.layer.Tile({
                       source: new ol.source.MapQuest({layer: 'sat'})
                     })
                   ],
                   view: new ol.View({
                     center: ol.proj.transform([37.41, 8.82], 'EPSG:4326', 'EPSG:3857'),
                     zoom: 4
                   })
                 });

               // scope.map.on('click', function (evt) {
               //     scope.$apply(function () {
               //         scope.selectedPoint = {
               //             lat: evt.latlng.lat,
               //             lng: evt.latlng.lng
               //         };
               //     });
               // });

               // scope.api = {
               //     applyCQL: function (cql) {
               //         console.log(cql);
               //     }
               // };

            }

        };
    }]);
