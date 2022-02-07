$(window).on('load', function () {
  if ($('#preloader').length) {
    $('#preloader').delay(1000).fadeOut('slow',function () {
      $(this).remove();
    });
  }
});

const accessToken = 'cOYvUkIr2QTC1XUq4cllxAvdITUWUPMEJp9b84EhqypFuJabteMQtGFND8eBRj8n';
const map = L.map('map');

// Built in function for finding your location
map.locate({setView: true, maxZoom: 8});

//var info = L.control();

var legend = L.control({position: 'topright'});

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

 // info.update(layer.feature.properties);
}

function resetHighlight(e) {
  geojson.resetStyle(e.target);
 // info.update();
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
            $('#country-select').append(`<option name="country" value=${result.data[i].iso_a3}>${result.data[i].name}</option>`);
          } else if (result.data[i].name == 'N. Cyprus') {
            $('#country-select').append(`<option name="country" value="CYP">${result.data[i].name}</option>`);
          } else if (result.data[i].name == 'Kosovo') {
            $('#country-select').append(`<option name="country" value="UNK">${result.data[i].name}</option>`);
          } else {
            $('#country-select').append(`<option name="country" value="MLI">${result.data[i].name}</option>`);
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

// Changes the boundary on the map to match the selected location
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
});

// Gets the country info to be diplayed when each country is selected
$('#country-select').change(function() {
  $.ajax({
    url: "libs/php/getCountryInfo.php",
    type: 'POST',
    dataType: 'json',
    data: {
      country: $('#country-select option:selected').val()
    },
    success: function(result) {
      console.log('Get Country Info Call Success')

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
  
            document.getElementById("infobox").innerHTML =
              "<b>Country:</b> " + result.data.name.common + " <img src="+ result.data.flags.png +" width='16'  height='12'></img>" + "<br>" +
              "<b>Capital:</b> " + ($('#country-select option:selected').text() == 'Somaliland' ? 'Hargeysa' : result.data.capital[0]) + "<br>" +
              "<b>Languages:</b> " + Languages[Object.keys(Languages)[0]] + (Languages[Object.keys(Languages)[1]] ? ", " + Languages[Object.keys(Languages)[1]] : '') + "<br>" +
              "<b>Area:</b> " + result.data.area + " km<sup>2</sup><br>" + 
              "<b>Population:</b> " + result.data.population + " people <br>" +
              "<b>Main Currency:</b> " + currencyKey1.name + " (" + currencyKey1.symbol + ")<br>" +
              "<b>Exchange Rates from $USD: " + currencyOne + "</b> " + currencyKey1.symbol + mainC + (currencyTwo ? ", <b>" + currencyTwo : "") + "</b>" + (secondC ? currencyKey2.symbol + secondC.toFixed(2) : '');
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
          capitalMark = L.marker([capitalLat, capitalLon]).addTo(map)
          .bindPopup(`Welcome to ${result.data.capital}.<br> more information here.`)
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
map.on('click', onMapClick);