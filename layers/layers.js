var baseLayer = new ol.layer.Group({
    'title': 'Base maps',
    layers: [
new ol.layer.Tile({
    'title': 'OSM DE',
    'type': 'base',
    source: new ol.source.XYZ({
        url: 'http://tile.openstreetmap.de/tiles/osmde/{z}/{x}/{y}.png',
        attributions: [new ol.Attribution({html: '&copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors,<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>'})]
    })
})
]
});
var format_confinicomunali = new ol.format.GeoJSON();
var features_confinicomunali = format_confinicomunali.readFeatures(geojson_confinicomunali, 
            {dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857'});
var jsonSource_confinicomunali = new ol.source.Vector();
jsonSource_confinicomunali.addFeatures(features_confinicomunali);var lyr_confinicomunali = new ol.layer.Vector({
                source:jsonSource_confinicomunali, 
                style: style_confinicomunali,
                title: "confini comunali"
            });var format_centrielocalit = new ol.format.GeoJSON();
var features_centrielocalit = format_centrielocalit.readFeatures(geojson_centrielocalit, 
            {dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857'});
var jsonSource_centrielocalit = new ol.source.Vector();
jsonSource_centrielocalit.addFeatures(features_centrielocalit);var lyr_centrielocalit = new ol.layer.Vector({
                source:jsonSource_centrielocalit, 
                style: style_centrielocalit,
                title: "centri e località"
            });

var lyr_Segnalazioni = new ol.layer.Tile({
                        source: new ol.source.TileWMS(({
                          url: "http://lrssvt.ns0.it/cgi-bin/qgis_mapserv.fcgi?map=/Library/WebServer/Documents/caveaquam/caveaquam.qgs&",
                          params: {"LAYERS": "eventi", "TILED": "true"},
                        })),
                        title: "Segnalazioni",
                        
                        
                      });

 



lyr_confinicomunali.setVisible(true);lyr_centrielocalit.setVisible(false);lyr_Segnalazioni.setVisible(true);
var layersList = [baseLayer,lyr_confinicomunali,lyr_centrielocalit,lyr_Segnalazioni];
lyr_confinicomunali.set('fieldAliases', {'Name': 'Name', });
lyr_centrielocalit.set('fieldAliases', {'Name': 'Name', });
lyr_confinicomunali.set('fieldImages', {'Name': 'TextEdit', });
lyr_centrielocalit.set('fieldImages', {'Name': 'TextEdit', });
lyr_confinicomunali.set('fieldLabels', {'Name': 'no label', });
lyr_centrielocalit.set('fieldLabels', {'Name': 'no label', });

