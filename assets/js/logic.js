// global
var myMap = "";

$(document).ready(function() {
    makeMap();

    // event listener
    $("#column").change(function() {
        makeMap();
    });
});

//this function is going to grab the data needed for the map
function makeMap() {
    // set title
    var column_text = $("#column option:selected").text();
    $("#maptitle").text(`${column_text} by County`);
    var geoData = "assets/data/us-county-boundaries.geojson";
    var csv = "assets/data/COVID-19 Vaccine Data by County.csv"

    // Perform a GET request to the query URL
    $.ajax({
        type: "GET",
        url: geoData,
        success: function(data) {
            d3.csv(csv).then(function(data2) {
                buildMap(data, data2);
            });
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
            alert("Status: " + textStatus);
            alert("Error: " + errorThrown);
        }
    });
}

// this function builds the map with leaflet
function buildMap(data, data2) {
    $("#mapcontainer").empty();
    $("#mapcontainer").append(`<div id="map"></div>`);
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
    myMap = L.map("map", {
        center: [31.5, -100],
        zoom: 6,
        layers: dark_mode
    });

    // Step 2: Build Data
    var county_list = [];
    data.features.forEach(function(county) {
        var polygon = L.geoJSON(county, {
            style: (feature) => getStyle(feature, data2),
            onEachFeature: (feature, layer) => onEachFeature(feature, layer, data2)
        });
        county_list.push(polygon);
    });

    var county_group = L.layerGroup(county_list);
    county_group.addTo(myMap);
    var column = $("#column").val();
    var minimum = data2.map(x => parseFloat(x[column].replace(/,/g, '')));
    minimum = minimum.filter(x => x);
    minimum = Math.min(...minimum);
    // Create Layer Legend
    var baseMaps = {
        "Light Mode": light_mode,
        "Dark Mode": dark_mode,
        "Satellite": satellite_mode
    };

    var overlayMaps = {
        "County": county_group,
    };
    // Slap Layer Legend onto the map
    L.control.layers(baseMaps, overlayMaps).addTo(myMap);

    // Set up the legend
    var legend = L.control({ position: "bottomright" });
    legend.onAdd = function() {
        var div = L.DomUtil.create("div", "info legend");

        // create legend as raw html
        var legendInfo = `<h2 style = "margin-bottom:5px"> ${column} </h2>
        <div>
        <div style = "background:yellow;height:10px;width:10px;display:inline-block"> </div> 
        <div style = "display:inline-block"> Less than 1,000 doses</div>
        </div> 
        <div>
        <div style = "background:orange;height:10px;width:10px;display:inline-block"> </div> 
        <div style = "display:inline-block">1,000 - 10,000 doses</div>
        </div> 
        <div>
        <div style = "background:red;height:10px;width:10px;display:inline-block"></div> 
        <div style = "display:inline-block">10,000 - 100,000 doses</div>
        </div>
        <div>
        <div style = "background:darkred;height:10px;width:10px;display:inline-block"></div>
        <div style = "display:inline-block">More than 100,000 doses</div>
        </div>`;
        div.innerHTML = legendInfo;
        return (div)
    }

    // Adding legend to the map
    legend.addTo(myMap);

}

function getStyle(feature, data2) {
    var column = $("#column").val();
    var filtered = data2.filter(x => x["County Name"] == feature.properties.name)[0];
    var minimum = data2.map(x => parseFloat(x[column].replace(/,/g, '')));
    minimum = minimum.filter(x => x);
    minimum = Math.min(...minimum);
    var mapStyle = {
        color: "black",
        fillColor: chooseColor(filtered, minimum),
        weight: 2,
        fillOpacity: 0.7
    }
    return (mapStyle);
}

function chooseColor(filtered, minimum) {
    var column = $("#column").val();
    var doses = parseFloat(filtered[column].replace(/,/g, ''));
    if (doses > 100000) {
        color = "darkred";
    } else if (doses > 10000) {
        color = "red"
    } else if (doses > 1000) {
        color = "orange"
    } else { color = "yellow" }
    return (color)
}

function onEachFeature(feature, layer, data2) {
    var column = $("#column").val();
    var filtered = data2.filter(x => x["County Name"] == feature.properties.name)[0];
    var doses = parseFloat(filtered[column].replace(/,/g, ''));
    // does this feature have a property named name?
    if (feature.properties && feature.properties.name) {
        layer.bindPopup(`<h3>${feature.properties.name}<br>${column}: ${doses}<br></h3>`);
    }
    // set mouse events
    layer.on({
        mouseover: function(event) {
            layer = event.target;
            layer.setStyle({
                fillOpacity: 1
            });
        },
        mouseout: function(event) {
            layer = event.target;
            layer.setStyle({
                fillOpacity: 0.7
            });
        },
        click: function(event) {
            layer = event.target;
        }
    });
}