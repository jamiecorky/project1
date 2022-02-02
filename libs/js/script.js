  // Ajax request to PHP to populate the nav select with countries
$('document').ready(function() {
  $.ajax({
    url: "libs/php/getGeoJson.php",
    type: 'GET',
    dataType: 'json',
    success: function(result) {
      if (result.status.name == "ok") {
        for (let i = 0; i <= result.data.length; i++) {
          $('#country-select').append(`<option name="country" value=${result.data[i].iso_a2}>${result.data[i].name}</option>`);
        } 
      }
    },
    error: function(jqXHR, textStatus, errorThrown) {
      console.log('error')
    }
  }); 
});

// Array that will contain GeoJSON data
let myGeoJSON = [];

// Returns GeoJSON data and pushes it to myGeoJSON array above.
$('document').ready(function() {
  $.ajax({
    url: "libs/php/getCountryBorders.php",
    type: 'GET',
    dataType: 'json',
    success: function(result) {
      if (result.status.name == "ok") {
        for(let i = 0; i < result.data.length; i++){
          myGeoJSON.push(result.data[i]);
        }         
        // This line is only working within here, won't work outside of the function?
        L.geoJSON(myGeoJSON, {style: myStyle}).addTo(map);
      }
    },
    error: function(jqXHR, textStatus, errorThrown) {
      console.log('error');
    }
  }); 
});


const accessToken = 'cOYvUkIr2QTC1XUq4cllxAvdITUWUPMEJp9b84EhqypFuJabteMQtGFND8eBRj8n';
const map = L.map('map');

// Built in function for finding your location
map.locate({setView: true, maxZoom: 8});

// Function for when you are found on map to display pop up
function onLocationFound(e) {
  var radius = e.accuracy;

  L.marker(e.latlng).addTo(map)
      .bindPopup("Hey! Lets explore. Pick a country").openPopup();

  L.circle(e.latlng, radius).addTo(map);
}

function onLocationError(e) {
  alert(e.message);
}

map.on('locationerror', onLocationError);
map.on('locationfound', onLocationFound);

// Map tiles 
L.tileLayer(
  `https://tile.jawg.io/jawg-matrix/{z}/{x}/{y}.png?access-token=${accessToken}`, {
    attribution: '<a href="http://jawg.io" title="Tiles Courtesy of Jawg Maps" target="_blank" class="jawg-attrib">&copy; <b>Jawg</b>Maps</a> | <a href="https://www.openstreetmap.org/copyright" title="OpenStreetMap is open data licensed under ODbL" target="_blank" class="osm-attrib">&copy; OSM contributors</a>',
    maxZoom: 22
  }
).addTo(map);

// Style for map geoJSON country overlay (to be changed as a conditional on data)
const myStyle = {
  "color": "#00ff00",
  "weight": 5,
  "opacity": 0.5,
  "fillOpacity": 0
};

// This changes the location on the map to take you to the country selected in the dropdown.
$('#country-select').change(function() {
  $.ajax({
    url: "libs/php/countryCodeToLatLng.php",
    type: 'POST',
    dataType: 'json',
    data: {
      id: $('#country-select').val()
    },
    success: function(result) {
      //console.log(JSON.stringify(result));
      if (result.status.name == "ok") {
        let latlng = new L.latLng(result.data[0], result.data[1]);
        map.panTo(latlng);
        //console.log(result.data[0]);
      }
    },
    error: function(jqXHR, textStatus, errorThrown) {
      console.log('oops, error')
    }
  }); 
});