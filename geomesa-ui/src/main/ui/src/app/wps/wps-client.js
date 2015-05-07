angular.module('geomesa.wps', [])

    .controller('WpsController', ['$scope', function($scope) {
        var request = createWPSExecuteRequest('Who', 'true', 'ASC', 'true');

        OpenLayers.Request.POST({
            url: 'http://geomesa:8080/geoserver/wps',
            data: request,
            success: function(outputs){
                console.log(outputs.responseText);
            }
        });   
    }]);

function createWPSExecuteRequest(attribute, histogram, sort, sortByCount) {
    var request = OpenLayers.Format.XML.prototype.write
                (new OpenLayers.Format.WPSExecute().writeNode('wps:Execute', {   

        identifier: 'geomesa:Unique',
        dataInputs: [{
            identifier: 'features',
            reference: {
                mimeType: 'text/xml',
                href: "http://geoserver/wfs",
                method: 'POST',
                body: {
                    wfs: {
                        service: "WFS",
                        version: "1.0.0",
                        outputFormat: "GML2",
                        featurePrefix: "geomesa",
                        featureType: "QuickStart",
                        featureNS: "http://geomesa.org/"
                    }
                }
            }},
            { identifier: 'attribute',
            data: {
                literalData: {
                    value: attribute
                } 
            }},
            {identifier: 'histogram',
            data: {
                literalData: {
                    value: histogram
                }
            }},
            {identifier: 'sort',
            data: {
                literalData: {
                    value: sort
                }
            }},
            {identifier: 'sortByCount',
            data: {
                literalData: {
                    value: sortByCount
                }
            }}
        ],
        responseForm: {
            rawDataOutput: {
                mimeType: "text/xml; subtype=wfs-collection/1.0",
                identifier: 'result'
            }
        }
    }));

    return formatXml(request);
}

function formatXml(xml) {
    var formatted = '';
    var reg = /(>)(<)(\/*)/g;
    xml = xml.replace(reg, '$1\r\n$2$3');
    var pad = 0;
    jQuery.each(xml.split('\r\n'), function(index, node) {
        var indent = 0;
        if (node.match( /.+<\/\w[^>]*>$/ )) {
            indent = 0;
        } else if (node.match( /^<\/\w/ )) {
            if (pad !== 0) {
                pad -= 1;
            }
        } else if (node.match( /^<\w[^>]*[^\/]>.*$/ )) {
            indent = 1;
        } else {
            indent = 0;
        }
 
        var padding = '';
        for (var i = 0; i < pad; i++) {
            padding += '    ';
        }
 
        formatted += padding + node + '\r\n';
        pad += indent;
    });
 
    formatted = '<?xml version="1.0" encoding="UTF-8"?>\n' + formatted;
    formatted = formatted.replace("xlink:", "");
    return formatted;
}
