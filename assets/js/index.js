// Create the map
// L.Control.Zoom.prototype.options.position = 'topright';
var map = L.map('map').setView([23, 90], 16);

// map.zoomControl.setPosition('topright');


// var OpenStreetMap_Mapnik = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
// 	maxZoom: 19,
// 	attribution: ''
// });

var OpenStreetMap_DE = L.tileLayer('https://{s}.tile.openstreetmap.de/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: ''
}).addTo(map);

var googleStreets = L.tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
    maxZoom: 20,
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
});

var Esri_WorldImagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    maxZoom: 17,
    attribution: ''
});

var baseLayers = {
    'OSM': OpenStreetMap_DE,
    'Google': googleStreets,
    'Satellite': Esri_WorldImagery,
};

var layerControl = L.control.layers(baseLayers).addTo(map);
// layerControl.setPosition('bottomright');

var sidebar = L.control.sidebar('sidebar', {
    position: 'left'
});
map.addControl(sidebar);
sidebar.show();

var routingButton = L.easyButton('fa fa-road', function () {
    sidebar.toggle();
}).addTo(map);


var clickedLatLng;
var currentLatLng;
let routeControl;
let clickedMarker;
window.lrmConfig = {};

// Create the locate control
let locateControl = L.control.locate({
    strings: {
        title: "Locate me"
    },
    drawCircle: false,
    showPopup: false,
    flyTo: true,
    // position: 'topright',
    follow: true,
    setView: true,
    showCompass: true,
}).addTo(map);

var onLocationFound = function (e) {
    currentLatLng = e.latlng;
    console.log(currentLatLng);

    if (!clickedLatLng) {
        return;
    }

    if (routeControl) {
        map.removeControl(routeControl);
    }
    findRoute(currentLatLng, clickedLatLng);
    sidebar.show();

};
map.on('locationfound', onLocationFound);

// Listen for the locationerror event
map.on('locationerror', function (e) {
    alert("Could not access your location");
});

map.on('click', function (e) {
    clickedLatLng = e.latlng;
    console.log(clickedLatLng);
    if (clickedMarker) {
        map.removeLayer(clickedMarker);
    }
    clickedMarker = L.marker(clickedLatLng).addTo(map);

    if (!currentLatLng) {
        return;
    }

    if (routeControl) {
        map.removeControl(routeControl);
    }
    findRoute(currentLatLng, clickedLatLng);
    sidebar.show();

});

let findRoute = function (start, end) {
    let waypoints = [];
    if (start && end) {
        waypoints = [
            L.latLng(start.lat, start.lng),
            L.latLng(end.lat, end.lng)
        ]
    }
    routeControl = L.Routing.control(L.extend(window.lrmConfig, {
        waypoints: waypoints,
        geocoder: L.Control.Geocoder.nominatim(),
        routeWhileDragging: true,
        reverseWaypoints: true,
        showAlternatives: true,
        altLineOptions: {
            styles: [
                { color: 'black', opacity: 0.15, weight: 9 },
                { color: 'white', opacity: 0.8, weight: 6 },
                { color: 'blue', opacity: 0.5, weight: 2 }
            ]
        }
    })).addTo(map);
    L.Routing.errorControl(routeControl).addTo(map);

    var routingControlContainer = routeControl.getContainer();
    var controlContainerParent = routingControlContainer.parentNode;
    controlContainerParent.removeChild(routingControlContainer);
    var itineraryDiv = document.getElementById('routeDiv');
    itineraryDiv.appendChild(routingControlContainer);
}

findRoute();