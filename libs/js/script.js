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


function style(feature) {
  return {
    weight: 2,
    opacity: 1,
    color: 'white',
    dashArray: '8',
    fillOpacity: 0.0,
    fillColor: '#FFFFFF'
  };
}

function highlightFeature(e) {
  var layer = e.target;

  layer.setStyle({
    weight: 5,
    color: '#666',
    dashArray: '',
    fillOpacity: 0.1
  });

  if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
    layer.bringToFront();
  }

  //info.update(layer.feature.properties);
}

function resetHighlight(e) {
  geojson.resetStyle(e.target);
  // info.update();
}

// Zooms to feature on map when clicked
function zoomToFeature(e) {
  map.fitBounds(e.target.getBounds());
}

function onEachFeature(feature, layer) {
  layer.on({
    mouseover: highlightFeature,
    mouseout: resetHighlight,
    click: zoomToFeature
  });
}  
  
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

// // Array that will contain GeoJSON data
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
        geojson = L.geoJson(myGeoJSON, {
          style: style,
          onEachFeature: onEachFeature
        }).addTo(map);
      }
    },
    error: function(jqXHR, textStatus, errorThrown) {
      console.log('error');
    }
  }); 
});

// Trying to re-code the function below to set the map bounds to the geoJSON data when the select option is changed. 
$('#country-select').change(function() {
  $.ajax({
    url: "libs/php/clickToMapBounds.php",
    type: 'GET',
    dataType: 'json',
    success: function(result) {
      if (result.status.name == "ok") {
        // for (let i = 0; i <= result.data.length; i++) {
        //   $('#country-select').text() 
        // } 
        //map.fitBounds([result.data[0]]);
          console.log(result.data[6]);
          map.fitBounds(result.data[6].geometry.coordinates);          
      }
    },
    error: function(jqXHR, textStatus, errorThrown) {
      console.log('error');
    }
  }); 
});


// This changes the location on the map to take you to the country selected in the dropdown.
// $('#country-select').change(function() {
//   $.ajax({
//     url: "libs/php/countryCodeToLatLng.php",
//     type: 'POST',
//     dataType: 'json',
//     data: {
//       id: $('#country-select').val()
//     },
//     success: function(result) {
//       //console.log(JSON.stringify(result));
//       if (result.status.name == "ok") {
//         let latlng = new L.latLng(result.data[0], result.data[1]);
// Changed this line to fitBounds - won't work due to latlng being a single point.
//         map.fitBounds([latlng]);
//         //console.log(result.data[0]);
//       }
//     },
//     error: function(jqXHR, textStatus, errorThrown) {
//       console.log('oops, error')
//     }
//   }); 
// });