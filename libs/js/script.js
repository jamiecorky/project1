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

// control that shows state info on hover
var info = L.control();

info.onAdd = function (map) {
  this._div = L.DomUtil.create('div', 'info');
  this.update();
  return this._div;
};

info.update = function (props) {
  this._div.innerHTML = '<h4>Country Info</h4>' +  (props ?
    /*'<b>' + props.name + '</b><br />' + props.density +*/ ' Well done, you found a country' : 'Select a country for info');
};

info.addTo(map);


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

  info.update(layer.feature.properties);
}

function resetHighlight(e) {
  geojson.resetStyle(e.target);
  info.update();
}


function zoomToFeature(e) {
  map.fitBounds(e.target.getBounds());
}

function onEachFeature(feature, layer) {
  layer.on({
    mouseover: highlightFeature,
    mouseout: resetHighlight,
    click: zoomToFeature,
  });
}  

// const personIcon = L.icon({
//   iconUrl: '../libs/img/tourist',

//   iconSize:     [38, 95], // size of the icon
//   shadowSize:   [50, 64], // size of the shadow
//   iconAnchor:   [22, 94], // point of the icon which will correspond to marker's location
//   shadowAnchor: [4, 62],  // the same for the shadow
//   popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
// });
  
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

// Global array being pushed geoJSON bounds
let geojson;
let myGeoJSON = [];

$('#country-select').change(function() {
  const countryName = $('#country-select option:selected').text();
  const countryVal = $('#country-select option:selected').val();
  $.ajax({
    url: "libs/php/getCountryBorders.php",
    type: 'POST',
    dataType: 'json',
    data: { name: countryName, 
            value: countryVal
          },
    success: function(result) {
      if (result.status.name == "ok") {
          //pushes geoJSON data to array
          myGeoJSON.push(result.returnBorder[0])
          if(geojson){
            geojson.clearLayers()
        }
          //geojson being initiated as a layer? cannot clear layer before next line - takes in myGeoJSON for boundary data.
          geojson = L.geoJson(myGeoJSON, {
          style: style,
          onEachFeature: onEachFeature
          }).addTo(map);
          map.fitBounds(geojson.getBounds());
          // The function below should clear all previous feature data on the map, this would need to happen before the current selection
          //geojson.clearLayers();

          // SHOULD take away the previous country data when a new country is selected because fitbounds will fit all countries in this case.
          if (myGeoJSON.length >= 1) {
            myGeoJSON.shift();
          }
      }
    },
    error: function(jqXHR, textStatus, errorThrown) {
      console.log('error');
    }
  }); 
});