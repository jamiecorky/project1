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
  iconAnchor:   [30, 30], 
  popupAnchor:  [0, -20] 
});

const capitalIcon = L.icon({
  iconUrl: 'libs/img/capital.png',
  iconSize:     [60, 60], 
  iconAnchor:   [30, 30], 
  popupAnchor:  [0, -20] 
});

const wikiIcon = L.icon({
  iconUrl: 'libs/img/wiki.png',
  iconSize:     [60, 60], 
  iconAnchor:   [30, 30], 
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



const map = L.map('map', {layers: [streets, dark]});
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
let wikiGroup;

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

  
            document.getElementById("infobox").innerHTML =
              "<b>Country:</b> " + result.data.name.common + " <img src="+ result.data.flags.png +" width='16'  height='12'></img>" + "<br>" +
              "<b>Capital:</b> " + ($('#country-select option:selected').text() == 'Somaliland' ? 'Hargeysa' : result.data.capital[0]) + "<br>" +
              "<b>Languages:</b> " + Languages[Object.keys(Languages)[0]] + (Languages[Object.keys(Languages)[1]] ? ", " + Languages[Object.keys(Languages)[1]] : '') + "<br>" +
              "<b>Area:</b> " + result.data.area + " km<sup>2</sup><br>" + 
              "<b>Population:</b> " + result.data.population + " people <br>" +
              "<b>Main Currency:</b> " + currencyKey1.name + " (" + currencyKey1.symbol + ")<br>" +
              "<b>Exchange Rates from $USD: " + currencyOne + "</b> " + currencyKey1.symbol + mainC + (currencyTwo ? ", <b>" + currencyTwo : "") + " </b>" + (secondC ? currencyKey2.symbol + secondC.toFixed(2) : '');
          }
        },
        error: function(jqXHR, textStatus, errorThrown) {
          console.log('Error Currency In Rates Call'); 
        }
      });
      // Get wiki info to place as markers on map
      $.ajax({
        url: "libs/php/getWikiInfo.php",
        type: 'POST',
        dataType: 'json',
        data: {
          lat: capitalLat,
          lng: capitalLon
        },
        success: function(result) {
          if (result.status.name == "ok") {
            if(wikiGroup !== undefined) {
              wikiGroup.clearLayers();
              map.removeLayer(wikiGroup)
            }

            wikiGroup = L.layerGroup().addTo(map);
            map.on('click', onMapClick);            

            for (let i = 0; i < result.data.length; i++) {
              L.marker([result.data[i].lat, result.data[i].lng], {icon: wikiIcon}).addTo(wikiGroup)
              .on('click', markerOnClick)
              .addTo(map)
              .bindPopup("<b>" + result.data[i].title + "</b><br>" + result.data[i].summary + " <a href='https://" + result.data[i].wikipediaUrl + "' target='blank'>Read more...</a>")
            }
          }
        },
        error: function(jqXHR, textStatus, errorThrown) {
          console.log('error here')
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
        .bindPopup(`Welcome to ${result.data.capital}`)
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
