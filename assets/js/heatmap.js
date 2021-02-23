// global
var myMap = "";

$(document).ready(function() {
    makeMap();
});

//this function is going to grab the data needed for the map
function makeMap() {
    var queryUrl = "https://services1.arcgis.com/0MSEUqKaxRlEPj5g/arcgis/rest/services/ncov_cases_US/FeatureServer/0/query?where=1%3D1&outFields=OBJECTID,Province_State,Country_Region,Lat,Long_,Confirmed&outSR=4326&f=json";


    // Perform a GET request to the query URL
    $.ajax({
        type: "GET",
        url: queryUrl,
        success: function(data) {
            data = JSON.parse(data);
            // console.log(data);

            buildMap(data);
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
            alert("Status: " + textStatus);
            alert("Error: " + errorThrown);
        }
    });
}

function buildMap(data) {
    // Step 0: Create the Tile Layers
    // Add a tile layer
    var dark_mode = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
        tileSize: 512,
        maxZoom: 18,
        zoomOffset: -1,
        id: "mapbox/dark-v10",
        accessToken: API_KEY
    });

    var light_mode = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
        tileSize: 512,
        maxZoom: 18,
        zoomOffset: -1,
        id: "mapbox/light-v10",
        accessToken: API_KEY
    });

    var satellite_mode = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
        tileSize: 512,
        maxZoom: 18,
        zoomOffset: -1,
        id: "mapbox/satellite-v9",
        accessToken: API_KEY
    });

    // STEP 1: INIT MAP
    // Create a map object
    myMap = L.map("heatmap", {
        center: [37.0902, -95.7129],
        zoom: 4.45,
        layers: dark_mode
    });

    //Step 2: Build the data
    var marker_clusters = L.markerClusterGroup();
    var heatmap_list = [];
    data.features.forEach(function(covid) {
        if (covid.geometry && Object.keys(covid.geometry).length == 2) {
            var marker = L.marker([covid.geometry["y"], covid.geometry["x"]], {
                draggable: false
            });
            marker.bindPopup(`<h3>Confirmed Cases: ${covid.attributes.Confirmed}</h3>`);
            // marker_list.push(marker);
            marker_clusters.addLayer(marker);

            heatmap_list.push([covid.geometry["y"], covid.geometry["x"]])
        }

    });

    // var marker_group = L.layerGroup(marker_list);
    marker_clusters.addTo(myMap);


    var heat_layer = L.heatLayer(heatmap_list, {
        radius: 17,
        blur: 5
    });
    heat_layer.addTo(myMap);

    // Create Layer Legend
    var baseMaps = {
        "Light Mode": light_mode,
        "Dark Mode": dark_mode,
        "Satellite": satellite_mode
    };

    var overlayMaps = {
        "Markers": marker_clusters,
        "Heatmap": heat_layer
    };

    // Slap Layer Legend onto the map
    L.control.layers(baseMaps, overlayMaps).addTo(myMap);

}