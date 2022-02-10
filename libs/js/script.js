$(window).on('load', function () {
  if ($('#preloader').length) {
    $('#preloader').delay(1000).fadeOut('slow',function () {
      $(this).remove();
    });
  }
});

const youIcon = L.icon({
  iconUrl: 'libs/img/you.png',
  iconSize:     [60, 60], 
  iconAnchor:   [30, 60], 
  popupAnchor:  [0, -20] 
});

const capitalIcon = L.icon({
  iconUrl: 'libs/img/capital.png',
  iconSize:     [60, 60], 
  iconAnchor:   [30, 60], 
  popupAnchor:  [0, -20] 
});

const cityIcon = L.icon({
  iconUrl: 'libs/img/city.png',
  iconSize:     [60, 60], 
  iconAnchor:   [30, 60], 
  popupAnchor:  [0, -20] 
});

const wikiIcon = L.icon({
  iconUrl: 'libs/img/wiki.png',
  iconSize:     [60, 60], 
  iconAnchor:   [30, 60], 
  popupAnchor:  [0, -20] 
});

const accessToken = 'cOYvUkIr2QTC1XUq4cllxAvdITUWUPMEJp9b84EhqypFuJabteMQtGFND8eBRj8n';

// Map tiles 
const dark = L.tileLayer(
  `https://tile.jawg.io/jawg-matrix/{z}/{x}/{y}.png?access-token=${accessToken}`, {
    attribution: '<a href="http://jawg.io" title="Tiles Courtesy of Jawg Maps" target="_blank" class="jawg-attrib">&copy; <b>Jawg</b>Maps</a> | <a href="https://www.openstreetmap.org/copyright" title="OpenStreetMap is open data licensed under ODbL" target="_blank" class="osm-attrib">&copy; OSM contributors</a>',
    maxZoom: 22
  }
)
const streets = L.tileLayer(
  `https://tile.jawg.io/jawg-streets/{z}/{x}/{y}{r}.png?access-token=${accessToken}`, {
    attribution: '<a href="http://jawg.io" title="Tiles Courtesy of Jawg Maps" target="_blank" class="jawg-attrib">&copy; <b>Jawg</b>Maps</a> | <a href="https://www.openstreetmap.org/copyright" title="OpenStreetMap is open data licensed under ODbL" target="_blank" class="osm-attrib">&copy; OSM contributors</a>',
    maxZoom: 22
  }
)

const baseMaps = {
  "Dark": dark,
  "Streets": streets
};

let yourLat = [];
let yourLng = [];

const corner1 = L.latLng(-90, -200)
const corner2 = L.latLng(90, 200)
const bounds = L.latLngBounds(corner1, corner2)

const map = L.map('map', {
  layers: [streets, dark],
  minZoom: 2,
  maxBoundsViscosity: 1,
  maxBounds: bounds
});

let mapControl = L.control.layers(baseMaps).addTo(map);

L.control.attribution({prefix: 'icons from freepik'}).addTo(map);

// Built in function for finding your location
map.locate({setView: true, maxZoom: 16});

const legend = L.control({position: 'bottomright'});

legend.onAdd = function (map) {
  var div = L.DomUtil.create('div', 'info legend');
  div.setAttribute('id', 'infobox');
  div.innerHTML = "<b>Pick a country for more info</b>";
  return div;
};
legend.addTo(map);

// Function for when you are found on map to display pop up
function onLocationFound(e) {
  var radius = e.accuracy;
  L.marker(e.latlng, {icon: youIcon}).addTo(map)
  .bindPopup("Hey! Lets explore. Pick a country").openPopup();

  L.circle(e.latlng, radius).addTo(map);

  yourLat.push(e.latlng.lat);
  yourLng.push(e.latlng.lng);

  L.easyButton( 'fa-location-arrow', function(){
    map.setView(e.latlng)
    .setZoom(12)
  }).addTo(map);

  // Updates select menu with current country
  $.ajax({
    url: "libs/php/getCurrentCountryCode.php",
    type: 'POST',
    dataType: 'json',
    data: { lat: e.latlng.lat, 
            lng: e.latlng.lng
          },
    success: function(result) {
      if (result.status.name == "ok") {
        //console.log(result.data.countryCode)
        $("#country-select").val(result.data.countryCode).change();
      }
    },
    error: function(jqXHR, textStatus, errorThrown) {
      console.log('your lat lng error');
    }
  }); 
}

function onLocationError(e) {
  alert(e.message);
}

map.on('locationerror', onLocationError);
map.on('locationfound', onLocationFound);

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
  const layer = e.target;

  layer.setStyle({
    weight: 5,
    color: '#666',
    dashArray: '',
    fillOpacity: 0
  });

  if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
    layer.bringToFront();
  }
}

function resetHighlight(e) {
  geojson.resetStyle(e.target);

}

function zoomToFeature(e) {
  map.fitBounds(e.target.getBounds());
}

function onEachFeature(feature, layer) {
  layer.on({
    mouseover: highlightFeature,
    mouseout: resetHighlight,
    click: zoomToFeature,
    click: onMapClick,
  });  
}

function markerOnClick(e)
{
  var latLngs = [e.target.getLatLng()];
  var markerBounds = L.latLngBounds(latLngs);
  map.fitBounds(markerBounds);
  map.setZoom(15);
}
  // Ajax request to PHP to populate the nav select with countries
$('document').ready(function() {
  $.ajax({
    url: "libs/php/getGeoJson.php",
    type: 'GET',
    dataType: 'json',
    success: function(result) {
      if (result.status.name == "ok") {
        // Adds countries from GeoJSON to select menu - fixes some naming errors also
        for (let i = 0; i < result.data.length; i++) {
          if (result.data[i].iso_a3 !== '-99') {
            $('#country-select').append(`<option name="country" value=${result.data[i].iso_a2}>${result.data[i].name}</option>`);
          } else if (result.data[i].name == 'N. Cyprus') {
            $('#country-select').append(`<option name="country" value="CY">${result.data[i].name}</option>`);
          } else if (result.data[i].name == 'Kosovo') {
            $('#country-select').append(`<option name="country" value="XK">${result.data[i].name}</option>`); // may need to double check this, issue with 2 digit code
          } else {
            $('#country-select').append(`<option name="country" value="ML">${result.data[i].name}</option>`);
          } 
        }      
      }
    },
    error: function(jqXHR, textStatus, errorThrown) {
      console.log('error')
    }
  });
});


// Global variables
let geojson;
let myGeoJSON = [];
let nameSelected = [];
let countryInfo = [];
let capitalMark = {};
let cityMark = {};
let cityGroup;
let wikiGroup;

function removeCities() {
  if(cityGroup !== undefined) {
    cityGroup.clearLayers();
    mapControl.removeLayer(cityGroup)
  }
}

function addCities() {
  cityGroup = L.markerClusterGroup();
}




const infoButton = L.easyButton('fa-info-circle', function(btn, map){
  $('#countryModal').modal('show');}).addTo(map);

// Changes the boundary on the map to match the selected location
$('#country-select').change(function() {
  const countryName = $('#country-select option:selected').text();
  const countryVal = $('#country-select option:selected').val();

  // Creates the geoJSON borders on the map when the country is selected
  $.ajax({
    url: "libs/php/getCountryBorders.php",
    type: 'POST',
    dataType: 'json',
    data: { name: countryName, 
            value: countryVal
          },
    success: function(result) {
      if (result.status.name == "ok") {
        //console.log(result)
        myGeoJSON.push(result.returnBorder[0])
        nameSelected.push(result.returnName);
        if(geojson){
          geojson.clearLayers();
        }
        geojson = L.geoJson(myGeoJSON, {
          style: style,
          onEachFeature: onEachFeature
        }).addTo(map);
        map.fitBounds(geojson.getBounds());
        // Removes previous results from array so [0] is always the new result
        if (myGeoJSON.length >= 1) {
          myGeoJSON.shift();
          nameSelected.shift();
        }      
      }
    },
    error: function(jqXHR, textStatus, errorThrown) {
      console.log('Ajax border error');
    }
  }); 
  
  $.ajax({
    url: "libs/php/getCountryBoundingBox.php",
    type: 'POST',
    dataType: 'json',
    data: {
      country: $('#country-select').val(),
    },
    success: function(border) {
      if (border.status.name == "ok") {
        // Get wiki info to place as markers on map
        $.ajax({
          url: "libs/php/getWikiInfo.php",
          type: 'POST',
          dataType: 'json',
          data: {
            north: border.data.north,
            south: border.data.south,
            east: border.data.east,
            west: border.data.west
          },
          success: function(result) {
            if (result.status.name == "ok") {
              if(wikiGroup) {
                wikiGroup.clearLayers();
                mapControl.removeLayer(wikiGroup)
              }

              wikiGroup = L.markerClusterGroup();

              
              mapControl.addOverlay(wikiGroup, "Wiki Pins");  

              let markers = [];
              for (let i = 0; i < result.data.length; i++) {
                markers.push(L.marker([result.data[i].lat, result.data[i].lng], {icon: wikiIcon}).on('click', markerOnClick)
                .bindPopup("<b>" + result.data[i].title + "</b><br>" + result.data[i].summary + " <a href='https://" + result.data[i].wikipediaUrl + "' target='blank'>Read more...</a>"));
              }

              wikiGroup.addLayers(markers);
              map.addLayer(wikiGroup);
            }
          },
          error: function(jqXHR, textStatus, errorThrown) {
            console.log('error here')
          }
        }); 

        // Get cities info to place as markers on map
        $.ajax({
          url: "libs/php/getCities.php",
          type: 'POST',
          dataType: 'json',
          data: {
            north: border.data.north,
            south: border.data.south,
            east: border.data.east,
            west: border.data.west
          },
          success: function(cities) {
            if (cities.status.name == "ok") {
              removeCities();
              addCities();
              mapControl.addOverlay(cityGroup, "Cities");   

              let markers = []
              for (let i = 0; i < cities.data.length; i++) {
                if(cities.data[i].countrycode == $('#country-select').val()) {
                  markers.push(L.marker([cities.data[i].lat, cities.data[i].lng], {icon: capitalIcon}).on('click', markerOnClick)
                  .bindPopup("<b>Welcome to " + cities.data[i].name + "</b><br>Population: " + cities.data[i].population + " <a href='https://" + cities.data[i].wikipedia + "' target='blank'>Read more...</a>"));
                }
              } 
              
              cityGroup.addLayers(markers);
              map.addLayer(cityGroup)
            
            }
          },
          error: function(jqXHR, textStatus, errorThrown) {
            console.log('error here')
          }
        }); 
      }
    },
    error: function(jqXHR, textStatus, errorThrown) {
      console.log('error getting bounding box')
    }
  });
  
  // Gets the country info to be diplayed when each country is selected
  $.ajax({
    url: "libs/php/getCountryInfo.php",
    type: 'POST',
    dataType: 'json',
    data: {
      country: $('#country-select option:selected').val()
    },
    success: function(result) {
      console.log(result)
      console.log('Get Country Info Call Success')
      let capitalLat = result.data.capitalInfo.latlng[0];
      let capitalLon = result.data.capitalInfo.latlng[1]; 

      // Nested to gain information about exchange rates from another - Updated Div with info from both APIS
      $.ajax({
        type: 'GET',
        url: "libs/php/getCurrencyRates.php",
        dataType: "json",
        success: function(exchange){
          if (exchange.status.name == "ok") {
            console.log("Exchange Call Success");
            const currenciesObject = result.data.currencies;
            const currencyOne = Object.keys(currenciesObject)[0];
            const currencyTwo = Object.keys(currenciesObject)[1];
            const currencyKey1 = currenciesObject[currencyOne];
            const currencyKey2 = currenciesObject[currencyTwo];        
            const mainC = exchange.data.rates[currencyOne].toFixed(2);
            const secondC = exchange.data.rates[currencyTwo];
            const Languages = result.data.languages;

  
            document.getElementById("country-modal-body").innerHTML =
              "<b>Country:</b> " + result.data.name.common + " <img src="+ result.data.flags.png +" width='16'  height='12'></img>" + "<br>" +
              "<b>Capital:</b> " + ($('#country-select option:selected').text() == 'Somaliland' ? 'Hargeysa' : result.data.capital[0]) + "<br>" +
              "<b>Languages:</b> " + Languages[Object.keys(Languages)[0]] + (Languages[Object.keys(Languages)[1]] ? ", " + Languages[Object.keys(Languages)[1]] : '') + "<br>" +
              "<b>Area:</b> " + result.data.area + " km<sup>2</sup><br>" + 
              "<b>Population:</b> " + result.data.population + " people <br>" +
              "<b>Main Currency:</b> " + currencyKey1.name + " (" + currencyKey1.symbol + ")<br>" +
              "<b>Exchange from $USD: " + currencyOne + "</b> " + currencyKey1.symbol + mainC + (currencyTwo ? ", <b>" + currencyTwo : "") + " </b>" + (secondC ? currencyKey2.symbol + secondC.toFixed(2) : '');
          }
        },
        error: function(jqXHR, textStatus, errorThrown) {
          console.log('Error Currency In Rates Call'); 
        }
      });

      if (result.status.name == "ok") {
        capitalLat = result.data.capitalInfo.latlng[0];
        capitalLon = result.data.capitalInfo.latlng[1]; 

        // If theres a capital marker already - Remove 
        if (capitalMark != undefined) {
          map.removeLayer(capitalMark)
        };

        // Adds selected country to map with marker and pop up text
        capitalMark = L.marker([capitalLat, capitalLon], {icon: capitalIcon})
        .on('click', markerOnClick)
        .addTo(map)
        .bindPopup(`<b>Welcome to ${result.data.capital}</b><br> Click here to see more`)
        .openPopup()
      }
    },
    error: function(jqXHR, textStatus, errorThrown) {
      console.log('Error In Get Country Info Call');
    }  
  }); 
});

// Weather API 
function onMapClick(e) {
  var popup = L.popup();
  $.ajax({
    url: "libs/php/findNearByWeather.php",
    type: 'POST',
    dataType: 'json',
    data: {
      lat: e.latlng.lat,
      lng: e.latlng.lng
    },
    success: function(result) {
      const celcius = result['data']['main']['temp'] - 273.15;
      if (result.status.name == "ok") {
        popup
        .setLatLng(e.latlng)
        .setContent(
          "<b>Location:</b> " + result['data']['name'] + "<br>" +
          "<b>Weather:</b> " + result['data']['weather'][0]['main'] + " - " + result['data']['weather'][0]['description'] + "<br>" +
          "<b>Temperature:</b> " + celcius.toFixed(1) + " &#8451;<br>" +
          "<b>Wind Speed:</b> " + result['data']['wind']['speed'].toFixed(1) + "mph" + "<br>" +
          (result['data']['wind']['gust'] ? "<b>Gusts:</b> " + result['data']['wind']['gust'].toFixed(1) + "mph" : '')
        )
        .openOn(map);
      }
    },
    error: function(jqXHR, textStatus, errorThrown) {
      // your error code
      console.log('error here')
    }
  }); 
}

// Styles
$(document).ready(function(){
  const win = $(window);
  if (win.width() <= 575) {
    $('.leaflet-control').css({'top': '95px'});
    $('#infobox').css({'background-color': '#fff', 'padding' :'5px', 'opacity': '1', 'font': '12px/16px Arial, Helvetica, sans-serif', 'margin-bottom': '5px', 'top': '0', 'border-radius': '5px', 'box-shadow': '0 0 15px rgba(0, 0, 0, 0.3)'});
    $('.legend').css({'color': '#212529', 'text-align' :'left'});
    $('.leaflet-control-attribution').css({'top': '0', 'text-align' :'left'});
    

  } else {
    $('.leaflet-control').css({'top': '55px'});
    $('#infobox').css({'background-color': '#fff', 'padding' :'6px', 'font': '14px/18px Arial, Helvetica, sans-serif', 'box-shadow': '0 0 15px rgba(0, 0, 0, 0.3)', 'border-radius': '5px', 'opacity': '1', 'margin-bottom': '10px', 'top': '0'});
    $('.legend').css({'color': '#212529', 'text-align' :'left'});
    $('.leaflet-control-attribution').css({'top': '0', 'text-align' :'left'});
  }
})

$(window).on('resize', function(){
  const win = $(this); //this = window
  if (win.width() <= 575) {
    $('.leaflet-control').css({'top': '95px'});
    $('#infobox').css({'padding' :'5px', 'margin-bottom': '5px', 'font': '12px/16px Arial, Helvetica, sans-serif', 'top': '0'});
    $('.leaflet-control-attribution').css({'top': '0', 'text-align' :'left'});
  }
  if (win.width() > 575 ) { 
    $('.leaflet-control').css({'top': '55px'});
    $('#infobox').css({'padding' :'6px', 'font': '14px/18px Arial, Helvetica, sans-serif', 'margin-bottom': '10px', 'top': '0'});
    $('.leaflet-control-attribution').css({'top': '0', 'text-align' :'left'});
  }
});