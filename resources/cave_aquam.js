/**
var measuring = false;
measureControl = function(opt_options) {

var options = opt_options || {};

var button = document.createElement('button');
button.innerHTML = '<img src="resources/measure-control.png" />';

var this_ = this;
var handleMeasure = function(e) {
if (!measuring) {
this_.getMap().addInteraction(draw);
createHelpTooltip();
createMeasureTooltip();
measuring = true;
}
else {
this_.getMap().removeInteraction(draw);
measuring = false;
this_.getMap().removeOverlay(helpTooltip);
this_.getMap().removeOverlay(measureTooltip);
}
};

button.addEventListener('click', handleMeasure, false);
button.addEventListener('touchstart', handleMeasure, false);

var element = document.createElement('div');
element.className = 'measure-control ol-unselectable ol-control';
element.appendChild(button);

ol.control.Control.call(this, {
element: element,
target: options.target
});

};
ol.inherits(measureControl, ol.control.Control);
*/

/**
* Define a namespace for the application.
*/
window.app = {};
var app = window.app;
/**
* @constructor
* @extends {ol.control.Control}
* @param {Object=} opt_options Control options.
*/
app.CustomToolbarControl = function(opt_options) {

    var options = opt_options || {};

    var button = document.createElement('button');
    button.innerHTML = 'Auto-Zoom';

    var element = document.createElement('div');
    element.className = 'ol-unselectable ol-mycontrol';
    element.appendChild(button);

    ol.control.Control.call(this, {
        element: element,
        target: options.target
    });

    var this_ = this;
    var handleRotateNorth = function(e) {
        this_.getMap().getView().setZoom(9);
        this_.getMap().getView().fit([1639475.760638, 4851119.449981, 1948918.696787, 5032911.315568], this_.getMap().getSize());
    };

    button.addEventListener('click', handleRotateNorth, false);

};
ol.inherits(app.CustomToolbarControl, ol.control.Control);

/**
* @constructor
* @extends {ol.control.Control}
* @param {Object=} opt_options Control options.
*/
app.divNotification = function(opt_options) {

    var options = opt_options || {};

    var div = document.createElement('div');
    div.className = 'ol-unselectable ol-notification';
    div.innerHTML = '';

    ol.control.Control.call(this, {
        element: div,
        target: options.target
    });

};
ol.inherits(app.divNotification, ol.control.Control);

/**
* @constructor
* @extends {ol.control.Control}
* @param {Object=} opt_options Control options.
*/
app.TrackMeControl = function(opt_options) {

    var options = opt_options || {};

    var button = document.createElement('button');
    button.innerHTML = 'N';

    button.addEventListener('click', function() {
        geolocation.setTracking(true);
    });

    // handle geolocation error.

    var element = document.createElement('div');
    element.className = 'trackme ol-unselectable ol-control';
    element.appendChild(button);

    ol.control.Control.call(this, {
      element: element,
      target: options.target
    });

};
ol.inherits(app.TrackMeControl, ol.control.Control);

var containerMark = document.getElementById('markpopup');
var closerMark = document.getElementById('markpopup-closer');
var contentMark = document.getElementById('markpopup-content');

/**
* Add a click handler to hide the popup.
* @return {boolean} Don't follow the href.
*/
closerMark.onclick = function() {
    window.overlayContentPopup.setPosition(undefined);
    window.containerMark.style.display = 'none';
    closerMark.blur();
    return false;
};




var container = document.getElementById('popup');
var content = document.getElementById('popup-content');
var closer = document.getElementById('popup-closer');
closer.onclick = function() {
    container.style.display = 'none';
    closer.blur();
    return false;
};
var overlayPopup = new ol.Overlay({
    element: container
});

var expandedAttribution = new ol.control.Attribution({
    collapsible: false
});

//This check is used to understand if we are on smartphone or not
var defaultMinZoom = 9;
if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
    defaultMinZoom = 8;
}

var map = new ol.Map({
    controls: ol.control.defaults({
        attributionOptions: /** @type {olx.control.AttributionOptions} */ ({
            collapsible: false
        })
    }).extend([
        expandedAttribution,
        new ol.control.ScaleLine({}),
        new ol.control.LayerSwitcher({tipLabel: "Layers"}),
        new app.CustomToolbarControl(),
        new app.divNotification(),
        new app.TrackMeControl()
    ]),
    target: document.getElementById('map'),
    renderer: 'canvas',
    overlays: [overlayPopup],
    layers: layersList,
    view: new ol.View({
        extent: [1639475.760638, 4851119.449981, 1948918.696787, 5032911.315568], maxZoom: 28, minZoom: defaultMinZoom
    })
});
map.getView().fit([1639475.760638, 4851119.449981, 1948918.696787, 5032911.315568], map.getSize());

var overlayContentPopup = new ol.Overlay(/** @type {olx.OverlayOptions} */ ({
    element: window.containerMark,
    autoPan: true,
    autoPanAnimation: {
        duration: 250
    }
}));
map.addOverlay(this.overlayContentPopup);

var NO_POPUP = 0
var ALL_FIELDS = 1

var geolocation = new ol.Geolocation({
    projection: map.getView().getProjection()
});

/**
* Returns either NO_POPUP, ALL_FIELDS or the name of a single field to use for
* a given layer
* @param layerList {Array} List of ol.Layer instances
* @param layer {ol.Layer} Layer to find field info about
*/
function getPopupFields(layerList, layer) {
    // Determine the index that the layer will have in the popupLayers Array,
    // if the layersList contains more items than popupLayers then we need to
    // adjust the index to take into account the base maps group
    var idx = layersList.indexOf(layer) - (layersList.length - popupLayers.length);
    return popupLayers[idx];
}


var collection = new ol.Collection();
var featureOverlay = new ol.layer.Vector({
    map: map,
    source: new ol.source.Vector({
        features: collection,
        useSpatialIndex: false // optional, might improve performance
    }),
    style: [new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: '#f00',
            width: 1
        }),
        fill: new ol.style.Fill({
            color: 'rgba(255,0,0,0.1)'
        }),
    })],
    updateWhileAnimating: true, // optional, for instant visual feedback
    updateWhileInteracting: true // optional, for instant visual feedback
});

var doHighlight = false;
var doHover = false;

var highlight;
var onPointerMove = function(evt) {
    if (!doHover && !doHighlight) {
        return;
    }
    var pixel = map.getEventPixel(evt.originalEvent);
    var coord = evt.coordinate;
    var popupField;
    var popupText = '';
    var currentFeature;
    var currentLayer;
    var currentFeatureKeys;
    map.forEachFeatureAtPixel(pixel, function(feature, layer) {
        // We only care about features from layers in the layersList, ignore
        // any other layers which the map might contain such as the vector
        // layer used by the measure tool
        if (layersList.indexOf(layer) === -1) {
            return;
        }
        currentFeature = feature;
        currentLayer = layer;
        currentFeatureKeys = currentFeature.getKeys();
        var doPopup = false;
        for (k in layer.get('fieldImages')) {
            if (layer.get('fieldImages')[k] != "Hidden") {
                doPopup = true;
            }
        }
        if (doPopup) {
            popupText = '<table>';
            for (var i=0; i<currentFeatureKeys.length; i++) {
                if (currentFeatureKeys[i] != 'geometry') {
                    popupField = '';
                    if (layer.get('fieldLabels')[currentFeatureKeys[i]] == "inline label") {
                        popupField += '<th>' + layer.get('fieldAliases')[currentFeatureKeys[i]] + ':</th><td>';
                    } else {
                        popupField += '<td colspan="2">';
                    }
                    if (layer.get('fieldLabels')[currentFeatureKeys[i]] == "header label") {
                        popupField += '<strong>' + layer.get('fieldAliases')[currentFeatureKeys[i]] + ':</strong><br />';
                    }
                    if (layer.get('fieldImages')[currentFeatureKeys[i]] != "Photo") {
                        popupField += (currentFeature.get(currentFeatureKeys[i]) != null ? Autolinker.link(String(currentFeature.get(currentFeatureKeys[i]))) + '</td>' : '');
                    } else {
                        popupField += (currentFeature.get(currentFeatureKeys[i]) != null ? '<img src="images/' + currentFeature.get(currentFeatureKeys[i]).replace(/[\\\/:]/g, '_').trim()  + '" /></td>' : '');
                    }
                    popupText = popupText + '<tr>' + popupField + '</tr>';
                }
            }
            popupText = popupText + '</table>';
        }
    });

    if (doHighlight) {
        if (currentFeature !== highlight) {
            if (highlight) {
                featureOverlay.getSource().removeFeature(highlight);
            }
            if (currentFeature) {
                var styleDefinition = currentLayer.getStyle().toString();

                if (currentFeature.getGeometry().getType() == 'Point') {
                    var radius = styleDefinition.split('radius')[1].split(' ')[1];

                    highlightStyle = new ol.style.Style({
                        image: new ol.style.Circle({
                            fill: new ol.style.Fill({
                                color: "#ffff00"
                            }),
                            radius: radius
                        })
                    })
                } else if (currentFeature.getGeometry().getType() == 'LineString') {

                    var featureWidth = styleDefinition.split('width')[1].split(' ')[1].replace('})','');

                    highlightStyle = new ol.style.Style({
                        stroke: new ol.style.Stroke({
                            color: '#ffff00',
                            lineDash: null,
                            width: featureWidth
                        })
                    });

                } else {
                    highlightStyle = new ol.style.Style({
                        fill: new ol.style.Fill({
                            color: '#ffff00'
                        })
                    })
                }
                featureOverlay.getSource().addFeature(currentFeature);
                featureOverlay.setStyle(highlightStyle);
            }
            highlight = currentFeature;
        }
    }

    if (doHover) {
        if (popupText) {
            overlayPopup.setPosition(coord);
            content.innerHTML = popupText;
            container.style.display = 'block';
        } else {
            container.style.display = 'none';
            closer.blur();
        }
    }
};

var selectedTextStyleFunction = function(name) {
    return new ol.style.Style({
        text: new ol.style.Text({
            font: 'bold 36px helvetica,sans-serif',
            //text: 'Caricamento In Corso...',
            textBaseline: 'bottom',
            textAlign: 'left',
            fill: new ol.style.Fill({
                color: '#000'
            }),
            stroke: new ol.style.Stroke({
                color: '#fff',
                width: 2
            })
        })
    });
};

var onSingleClick = function(evt) {
    if (doHover) {
        return;
    }
    var pixel = map.getEventPixel(evt.originalEvent);
    var coord = evt.coordinate;
    var popupField;
    var popupText = '';
    var currentFeature;
    var currentFeatureKeys;
    content.innerHTML = "";
    var divNotification = document.getElementsByClassName('ol-unselectable ol-notification');
    divNotification[0].innerHTML = "Caricamento dati...";
    map.forEachFeatureAtPixel(pixel, function(feature, layer) {
        currentFeature = feature;
        currentFeatureKeys = currentFeature.getKeys();
        //feature.setStyle (selectedTextStyleFunction());
        var doPopup = false;
        for (k in layer.get('fieldImages')) {
            if (layer.get('fieldImages')[k] != "Hidden") {
                doPopup = true;
            }
        }
        if (doPopup) {
            var prefix = '';
            popupText += '<table>';
            console.log(layer.get('name'));
            if(layer.get('name') == "centri_localita")
            {
                prefix = "Località ";
            }
            else
            {
                prefix = "Comune ";
            }
            for (var i=0; i<currentFeatureKeys.length; i++) {
                if (currentFeatureKeys[i] != 'geometry') {
                    popupField = '';
                    if (layer.get('fieldLabels')[currentFeatureKeys[i]] == "inline label") {
                        popupField += '<th>' + layer.get('fieldAliases')[currentFeatureKeys[i]] + ':</th><td>';
                    } else {
                        popupField += '<td bgcolor="#99CCCCC" colspan="2">' + prefix + ' di: ';
                    }
                    if (layer.get('fieldLabels')[currentFeatureKeys[i]] == "header label") {
                        popupField += '<strong>' + layer.get('fieldAliases')[currentFeatureKeys[i]] + ':</strong><br />';
                    }
                    if (layer.get('fieldImages')[currentFeatureKeys[i]] != "Photo") {
                        popupField += (currentFeature.get(currentFeatureKeys[i]) != null ? Autolinker.link(String(currentFeature.get(currentFeatureKeys[i]))) + '</td>' : '');
                    } else {
                        popupField += (currentFeature.get(currentFeatureKeys[i]) != null ? '<img src="images/' + currentFeature.get(currentFeatureKeys[i]).replace(/[\\\/:]/g, '_').trim()  + '" /></td>' : '');
                    }
                    popupText = popupText + '<tr>' + popupField + '</tr>';
                }
            }
            popupText = popupText + '</table>';
        }
    });

    overlayPopup.setPosition(coord);
    content.innerHTML += popupText;
    container.style.display = 'block';

    var view = map.getView();
    var viewResolution = /** @type {number} */ (view.getResolution());
    var wmsSource = new ol.source.TileWMS({
        url: 'http://lrssvt.ns0.it/cgi-bin/qgis_mapserv.fcgi?map=/Library/WebServer/Documents/caveaquam/caveaquam.qgs&',
        params: {'LAYERS': 'eventi', 'FI_POINT_TOLERANCE':'25'},
        serverType: 'qgis',
        //crossOrigin: 'anonymous'
    });

    var urlPoint = wmsSource.getGetFeatureInfoUrl(
        evt.coordinate, viewResolution, 'EPSG:3857',
        {'INFO_FORMAT': 'text/html'});

        if (urlPoint) {

            $.ajax({
                type: "POST",
                url: "./caveacquam.php",
                data: { link : urlPoint},
                dataType: "JSON", //tell jQuery to expect JSON encoded response
                timeout: 6000,
                success: function (response) {
                    console.log('success');
                    var obj = response;
                    divNotification[0].innerHTML = "";
                    if (obj.hasOwnProperty('Descrizione'))
                    {
                        //console.log(obj.Descrizione);
                        var tr= '<table>';
                        for (var key in obj) {
                            if (obj.hasOwnProperty(key)) {
                                console.log(key);
                                tr += ("<tr>");
                                tr +=("<td>" + key + "</td>");
                                var dataCopy = obj[key]
                                for(value in dataCopy){
                                    console.log(value );
                                    if(key == "Foto")
                                    {
                                        var src = '<img src="'+value +'" alt="Smiley face" height="42" width="42">';
                                        tr +=("<td>" + src + "</td>");
                                    }
                                    else
                                    {
                                        tr +=("<td>" + value + "</td>");
                                    }
                                }
                            }
                            tr += ("</tr>");
                        }

                        tr += '</table>';
                        $("#markpopup-content").html(tr);

                        var coordinate = evt.coordinate;
                        window.overlayContentPopup.setPosition(coordinate);
                        window.containerMark.style.display = 'block';
                    }
                    else
                    {
                        console.log("Coord Not Found");
                    }
                },
                error: function(data) {
                    console.log('Exception:'+data.responseText);
                }
            });

        }

    };

    /**
    map.on('pointermove', function(evt) {
    if (evt.dragging) {
    return;
}
if (measuring) {

var helpMsg = 'Click to start drawing';
if (sketch) {
var geom = (sketch.getGeometry());
if (geom instanceof ol.geom.Polygon) {
helpMsg = continuePolygonMsg;
} else if (geom instanceof ol.geom.LineString) {
helpMsg = continueLineMsg;
}
}
helpTooltipElement.innerHTML = helpMsg;
helpTooltip.setPosition(evt.coordinate);
}
});
*/

//Add search button
var geocoder = new Geocoder('nominatim', {
    provider: 'photon',
    lang: 'en-US',
    placeholder: 'Cerca ...',
    limit: 5,
    keepOpen: true
});
map.addControl(geocoder);

geocoder.on('addresschosen', function(evt){
    var feature = evt.feature,
    coord = evt.coordinate,
    address = evt.address;

    //content.innerHTML = '<p>'+ address.formatted +'</p>';
    //overlay.setPosition(coord);
});

map.on('pointermove', function(evt) {
    onPointerMove(evt);
});
map.on('singleclick', function(evt) {
    onSingleClick(evt);
});

/**
* Currently drawn feature.
* @type {ol.Feature}
*/
var sketch;


/**
* The help tooltip element.
* @type {Element}
*/
var helpTooltipElement;


/**
* Overlay to show the help messages.
* @type {ol.Overlay}
*/
var helpTooltip;


/**
* The measure tooltip element.
* @type {Element}
*/
var measureTooltipElement;


/**
* Overlay to show the measurement.
* @type {ol.Overlay}
*/
var measureTooltip;


/**
* Message to show when the user is drawing a line.
* @type {string}
*/
var continueLineMsg = 'Click to continue drawing the line';






var source = new ol.source.Vector();

var measureLayer = new ol.layer.Vector({
    source: source,
    style: new ol.style.Style({
        fill: new ol.style.Fill({
            color: 'rgba(255, 255, 255, 0.2)'
        }),
        stroke: new ol.style.Stroke({
            color: '#ffcc33',
            width: 3
        }),
        image: new ol.style.Circle({
            radius: 7,
            fill: new ol.style.Fill({
                color: '#ffcc33'
            })
        })
    })
});

map.addLayer(measureLayer);

var draw; // global so we can remove it later
function addInteraction() {
    var type = 'LineString';
    draw = new ol.interaction.Draw({
        source: source,
        type: /** @type {ol.geom.GeometryType} */ (type),
        style: new ol.style.Style({
            fill: new ol.style.Fill({
                color: 'rgba(255, 255, 255, 0.2)'
            }),
            stroke: new ol.style.Stroke({
                color: 'rgba(0, 0, 0, 0.5)',
                lineDash: [10, 10],
                width: 2
            }),
            image: new ol.style.Circle({
                radius: 5,
                stroke: new ol.style.Stroke({
                    color: 'rgba(0, 0, 0, 0.7)'
                }),
                fill: new ol.style.Fill({
                    color: 'rgba(255, 255, 255, 0.2)'
                })
            })
        })
    });

    var listener;
    draw.on('drawstart',
    function(evt) {
        // set sketch
        sketch = evt.feature;

        /** @type {ol.Coordinate|undefined} */
        var tooltipCoord = evt.coordinate;

        listener = sketch.getGeometry().on('change', function(evt) {
            var geom = evt.target;
            var output;
            output = formatLength( /** @type {ol.geom.LineString} */ (geom));
            tooltipCoord = geom.getLastCoordinate();
            measureTooltipElement.innerHTML = output;
            measureTooltip.setPosition(tooltipCoord);
        });
    }, this);

    draw.on('drawend',
    function(evt) {
        measureTooltipElement.className = 'tooltip tooltip-static';
        measureTooltip.setOffset([0, -7]);
        // unset sketch
        sketch = null;
        // unset tooltip so that a new one can be created
        measureTooltipElement = null;
        createMeasureTooltip();
        ol.Observable.unByKey(listener);
    }, this);
}


/**
* Creates a new help tooltip
*/
function createHelpTooltip() {
    if (helpTooltipElement) {
        helpTooltipElement.parentNode.removeChild(helpTooltipElement);
    }
    helpTooltipElement = document.createElement('div');
    helpTooltipElement.className = 'tooltip hidden';
    helpTooltip = new ol.Overlay({
        element: helpTooltipElement,
        offset: [15, 0],
        positioning: 'center-left'
    });
    map.addOverlay(helpTooltip);
}


/**
* Creates a new measure tooltip
*/
function createMeasureTooltip() {
    if (measureTooltipElement) {
        measureTooltipElement.parentNode.removeChild(measureTooltipElement);
    }
    measureTooltipElement = document.createElement('div');
    measureTooltipElement.className = 'tooltip tooltip-measure';
    measureTooltip = new ol.Overlay({
        element: measureTooltipElement,
        offset: [0, -15],
        positioning: 'bottom-center'
    });
    map.addOverlay(measureTooltip);
}


var wgs84Sphere = new ol.Sphere(6378137);

/**
* format length output
* @param {ol.geom.LineString} line
* @return {string}
*/
var formatLength = function(line) {
    var length;
    length = Math.round(line.getLength() * 100) / 100;
    var output;
    if (length > 100) {
        output = (Math.round(length / 1000 * 100) / 100) +
        ' ' + 'km';
    } else {
        output = (Math.round(length * 100) / 100) +
        ' ' + 'm';
    }
    return output;
};

addInteraction();




var attribution = document.getElementsByClassName('ol-attribution')[0];
var attributionList = attribution.getElementsByTagName('ul')[0];
var firstLayerAttribution = attributionList.getElementsByTagName('li')[0];
var qgis2webAttribution = document.createElement('li');
qgis2webAttribution.innerHTML = '<a href="https://caveaquam.wordpress.com/">site Cave Aquam</a>';
attributionList.insertBefore(qgis2webAttribution, firstLayerAttribution);
