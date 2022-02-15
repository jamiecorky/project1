$(window).on("load", function () {
  if ($("#preloader").length) {
    $("#preloader").delay(1000).fadeOut('slow',function () {
      $(this).remove();
    });
  }
});

const cityIcon = L.ExtraMarkers.icon({
  icon: 'fa-solid fa-city',
  markerColor: 'blue',
  shape: 'penta',
  prefix: 'fa'
});

const wikiIcon = L.ExtraMarkers.icon({
  icon: 'fa-brands fa-wikipedia-w',
  markerColor: 'orange',
  shape: 'square',
  prefix: 'fa'
});

const airportIcon = L.ExtraMarkers.icon({
  icon: 'fa-solid fa-plane-departure',
  markerColor: 'green',
  shape: 'circle',
  prefix: 'fa'
});



const accessToken = 'cOYvUkIr2QTC1XUq4cllxAvdITUWUPMEJp9b84EhqypFuJabteMQtGFND8eBRj8n';

// Map tiles 
const streets = L.tileLayer(
  `https://tile.jawg.io/jawg-streets/{z}/{x}/{y}.png?access-token=${accessToken}`, {
    attribution: '<a href="http://jawg.io" title="Tiles Courtesy of Jawg Maps" target="_blank" class="jawg-attrib">&copy; <b>Jawg</b>Maps</a>',
    maxZoom: 22
  }
)
const satellite = L.tileLayer('https://api.maptiler.com/tiles/satellite-v2/{z}/{x}/{y}.jpg?key=vT8D4gm5ejB3f5qXd1Ap', {
  tileSize: 512,
  zoomOffset: -1,
  minZoom: 1,
  attribution: '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a><a href="https://www.openstreetmap.org/copyright" target="_blank"> &copy; OpenStreetMap</a>',
  crossOrigin: true
  }
)


const baseMaps = {
  "Satellite": satellite,
  "Streets": streets
};

let yourLat = [];
let yourLng = [];

const corner1 = L.latLng(-90, -200)
const corner2 = L.latLng(90, 200)
const bounds = L.latLngBounds(corner1, corner2)

const map = L.map('map', {
  layers: [streets, satellite],
  minZoom: 2,
  maxBoundsViscosity: 1,
  maxBounds: bounds
});

let mapControl = L.control.layers(baseMaps).addTo(map);

// Built in function for finding your location
map.locate({setView: true, maxZoom: 16});

// Function for when you are found on map to display pop up
function onLocationFound(e) {
  // var radius = e.accuracy;
  // L.marker(e.latlng, {icon: youIcon}).addTo(map)
  // .bindPopup("Hey! Lets explore. Pick a country").openPopup();

  // L.circle(e.latlng, radius).addTo(map);

  yourLat.push(e.latlng.lat);
  yourLng.push(e.latlng.lng);

  // L.easyButton( 'fa-location-arrow', function(){
  //   map.setView(e.latlng)
  //   .setZoom(12)
  // }, {position: 'topright'}).addTo(map);

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
    // click: onMapClick,
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
            $('#country-select').append(`<option value=${result.data[i].iso_a2}>${result.data[i].name}</option>`);
          } else if (result.data[i].name == 'N. Cyprus') {
            $('#country-select').append(`<option  value="CY">${result.data[i].name}</option>`);
          } else if (result.data[i].name == 'Kosovo') {
            $('#country-select').append(`<option value="XK">${result.data[i].name}</option>`); // may need to double check this, issue with 2 digit code
          } else {
            $('#country-select').append(`<option value="ML">${result.data[i].name}</option>`);
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

function dayOfWeekAsString(dayIndex) {
  return ["Sunday", "Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][dayIndex] || '';
}

function addCities() {
  cityGroup = L.markerClusterGroup();
}

const countryButton = L.easyButton('fa-solid fa-info', function(btn, map){
  $('#country-modal').modal('show');}).addTo(map);

const weatherButton = L.easyButton('fa-solid fa-cloud-sun-rain', function(btn, map){
  $('#weather-modal').modal('show');}).addTo(map);
    
const currencyButton = L.easyButton('fa-solid fa-coins', function(btn, map){
$('#currency-modal').modal('show');}).addTo(map);

const covidButton = L.easyButton('fa-solid fa-virus-covid', function(btn, map){
  $('#covid-modal').modal('show');}).addTo(map);

const newsButton = L.easyButton('fa-solid fa-newspaper', function(btn, map){
  $('#news-modal').modal('show');}).addTo(map);

const holidaysButton = L.easyButton('fa-solid fa-calendar-plus', function(btn, map){
  $('#holidays-modal').modal('show');}).addTo(map);

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
    url: "libs/php/getCovidData.php",
    type: 'POST',
    dataType: 'json',
    data: { code: countryVal },
    success: function(covid) {
      if (covid.status.name == "ok") {
        console.log(covid)
        $("#covid-header").html(countryName + " Covid-19 Statistics");
        $("#confirmed-data").html("<td><i class='fa-solid fa-chart-line'></i></td><td>Confirmed Cases</td><td>" + covid.data.confirmed.toLocaleString() + "</td>")
        $("#critical-data").html("<td><i class='fa-solid fa-bed-pulse'></i></td><td>Critical Cases</td><td>" + covid.data.critical.toLocaleString() + "</td>")
        $("#deaths-data").html("<td><i class='fa-solid fa-hospital'></i></td><td>Total Deaths</td><td>" + covid.data.deaths.toLocaleString() + "</td>")
        $("#recovered-data").html("<td><i class='fa-solid fa-heart-pulse'></i></td><td>Total Recovered</td><td>" + covid.data.recovered.toLocaleString() + "</td>")

      }
    },
    error: function(jqXHR, textStatus, errorThrown) {
      console.log('covid error');
    }
  });   

  $.ajax({
    url: "libs/php/getNews.php",
    type: 'POST',
    dataType: 'json',
    data: { code: countryVal },
    success: function(news) {
      if (news.status.name == "ok") {
        nStory = news.data.articles;
        console.log(news)
        $("#news-header").html(countryName + " Top News");
        $("#news-story-0-img").html("<td><img class='rounded img-fluid' src ='" + nStory[0].urlToImage + "'></td>");
        $("#news-story-0-description").html("<td>" + nStory[0].title + "<br><a href='" + nStory[0].url + "' target = '_blank'>Read More...</a></td>");
        $("#news-story-1-img").html("<td><img class='rounded img-fluid' src ='" + nStory[1].urlToImage + "'></td>"); 
        $("#news-story-1-description").html("<td>" + nStory[1].title + "<br><a href='" + nStory[1].url + "' target = '_blank'>Read More...</a></td>");
        $("#news-story-2-img").html("<td><img class='rounded img-fluid' src ='" + nStory[2].urlToImage + "'></td>"); 
        $("#news-story-2-description").html("<td>" + nStory[2].title + "<br><a href='" + nStory[2].url + "' target = '_blank'>Read More...</a></td>")
        $("#news-story-3-img").html("<td><img class='rounded img-fluid' src ='" + nStory[3].urlToImage + "'></td>"); 
        $("#news-story-3-description").html("<td>" + nStory[3].title + "<br><a href='" + nStory[3].url + "' target = '_blank'>Read More...</a></td>");
        $("#news-story-4-img").html("<td><img class='rounded img-fluid' src ='" + nStory[4].urlToImage + "'></td>"); 
        $("#news-story-4-description").html("<td>" + nStory[4].title + "<br><a href='" + nStory[4].url + "' target = '_blank'>Read More...</a></td>");
      }
    },
    error: function(jqXHR, textStatus, errorThrown) {
      console.log('news error');
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
                  markers.push(L.marker([cities.data[i].lat, cities.data[i].lng], {icon: cityIcon}).on('click', markerOnClick)
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
      const populationMil = (result.data.population/1000000).toFixed(1);
      const Languages = result.data.languages;
      const startOfWeek = result.data.startOfWeek.charAt(0).toUpperCase() + result.data.startOfWeek.slice(1)

      // Easybutton modal - country info
      $(".country-flag").html("<img src=" + result.data.flags.png + " width='32' height='24'></img>");
      $(".country-title").html(result.data.name.common);
      $("#capital-data").html("<td><i class='fa-solid fa-city'></i></td><td>Capital City</td><td>" + ($('#country-select option:selected').text() == 'Somaliland' ? 'Hargeysa' : result.data.capital[0]) + "</td>")
      $("#languages-data").html("<td><i class='fa-solid fa-language'></i></td><td>Language(s) Spoken</td><td>" + Languages[Object.keys(Languages)[0]] + (Languages[Object.keys(Languages)[1]] ? ", " + Languages[Object.keys(Languages)[1]] + "</td>" : "</td>"))
      $("#area-data").html("<td><i class='fa-solid fa-earth-americas'></i></td><td>Area</td><td>" + result.data.area.toLocaleString("en-GB") + " km<sup>2</sup></td>")
      $("#population-data").html("<td><i class='fa-solid fa-person'></i></td><td>Population</td><td>" + populationMil + " million</td>")
      $("#week-start-data").html("<td><i class='fa-solid fa-calendar-day'></i></td><td>The week starts on</td><td>" + startOfWeek + "</td>")
      $("#drive-side-data").html("<td><i class='fa-solid fa-car-side'></i></td><td>Drive on the</td><td>" + result.data.car.side + " side</td>")

      // Nested to gain information about exchange rates from another - Updated Div with info from both APIS
      $.ajax({
        type: 'GET',
        url: "libs/php/getCurrencyRates.php",
        dataType: "json",
        success: function(exchange){
          if (exchange.status.name == "ok") {
            console.log("Exchange Call Success");
            console.log(result.data)
            const currenciesObject = result.data.currencies;
            const currencyOne = Object.keys(currenciesObject)[0];
            const currencyTwo = Object.keys(currenciesObject)[1];
            const currencyKey1 = currenciesObject[currencyOne];
            const currencyKey2 = currenciesObject[currencyTwo];        
            const mainC = exchange.data.rates[currencyOne].toFixed(2);
            const secondC = exchange.data.rates[currencyTwo];

            
            // Easybutton modal - country currency info
            $(".country-flag").html("<img src=" + result.data.flags.png + " width='32' height='24'></img>");
            $(".country-title").html(result.data.name.common);
            $("#main-currency-data").html("<td><i class='fa-solid fa-coins'></i></td><td>Main Currency</td><td>" + currencyKey1.name + "</td>")
            $("#exchange-usd").html("<td><i class='fa-solid fa-hand-holding-dollar'></i></td><td>Exchange From 1 USD</td><td>" + currencyOne + " " + currencyKey1.symbol + mainC + (currencyTwo ? ", " + currencyTwo : "") + " " + (secondC ? currencyKey2.symbol + secondC.toFixed(2) : ''))
            $("#area-data").html("<td><i class='fa-solid fa-earth-americas'></i></td><td>Area</td><td>" + result.data.area + " km<sup>2</sup></td>")
            $("#population-data").html("<td><i class='fa-solid fa-person'></i></td><td>Population</td><td>" + populationMil + " million</td>")
          }
        },
        error: function(jqXHR, textStatus, errorThrown) {
          console.log('Error Currency In Rates Call'); 
        }
      });

      $.ajax({
        url: "libs/php/findCapitalWeather.php",
        type: 'POST',
        dataType: 'json',
        data: {
          lat: result.data.capitalInfo.latlng[0],
          lng: result.data.capitalInfo.latlng[1]
        },
        success: function(weather) {         
          if (result.status.name == "ok") {
            const dWeather= weather.data.daily;
            // console.log(dWeather)

            $("#weather-location").html(result.data.capital + " 7 Day Weather Forecast");
            $("#weather-key").html("<td>Day</td><td>Weather</td><td>Min/Max</td><td>Wind</td></b>")
            $("#weather-0").html("<td>Today" + Date.parse("t").toString(', d MMM') + "</td><td>" + dWeather[0].weather[0].main + ", " + dWeather[0].weather[0].description + "</td><td>" + ((dWeather[0].temp.min-32)/1.8).toFixed(0) + "&#8451;/" + ((dWeather[0].temp.max-32)/1.8).toFixed(0) + "&#8451;</td><td>" + dWeather[0].wind_speed.toFixed(0) + "mph</td>")
            $("#weather-1").html("<td>" + Date.parse("t + 1d").toString('dddd, d MMM') + "</td><td>" + dWeather[1].weather[0].main + ", " + dWeather[1].weather[0].description + "</td><td>" + ((dWeather[1].temp.min-32)/1.8).toFixed(0) + "&#8451;/" + ((dWeather[1].temp.max-32)/1.8).toFixed(0) + "&#8451;</td><td>" + dWeather[1].wind_speed.toFixed(0) + "mph</td>")
            $("#weather-2").html("<td>" + Date.parse("t + 2d").toString('dddd, d MMM') + "</td><td>" + dWeather[2].weather[0].main + ", " + dWeather[2].weather[0].description + "</td><td>" + ((dWeather[2].temp.min-32)/1.8).toFixed(0) + "&#8451;/" + ((dWeather[2].temp.max-32)/1.8).toFixed(0) + "&#8451;</td><td>" + dWeather[2].wind_speed.toFixed(0) + "mph</td>")
            $("#weather-3").html("<td>" + Date.parse("t + 3d").toString('dddd, d MMM') + "</td><td>" + dWeather[3].weather[0].main + ", " + dWeather[3].weather[0].description + "</td><td>" + ((dWeather[3].temp.min-32)/1.8).toFixed(0) + "&#8451;/" + ((dWeather[3].temp.max-32)/1.8).toFixed(0) + "&#8451;</td><td>" + dWeather[3].wind_speed.toFixed(0) + "mph</td>")
            $("#weather-4").html("<td>" + Date.parse("t + 4d").toString('dddd, d MMM') + "</td><td>" + dWeather[4].weather[0].main + ", " + dWeather[4].weather[0].description + "</td><td>" + ((dWeather[4].temp.min-32)/1.8).toFixed(0) + "&#8451;/" + ((dWeather[4].temp.max-32)/1.8).toFixed(0) + "&#8451;</td><td>" + dWeather[4].wind_speed.toFixed(0) + "mph</td>")
            $("#weather-5").html("<td>" + Date.parse("t + 5d").toString('dddd, d MMM') + "</td><td>" + dWeather[5].weather[0].main + ", " + dWeather[5].weather[0].description + "</td><td>" + ((dWeather[5].temp.min-32)/1.8).toFixed(0) + "&#8451;/" + ((dWeather[5].temp.max-32)/1.8).toFixed(0) + "&#8451;</td><td>" + dWeather[5].wind_speed.toFixed(0) + "mph</td>")
            $("#weather-6").html("<td>" + Date.parse("t + 6d").toString('dddd, d MMM') + "</td><td>" + dWeather[6].weather[0].main + ", " + dWeather[6].weather[0].description + "</td><td>" + ((dWeather[6].temp.min-32)/1.8).toFixed(0) + "&#8451;/" + ((dWeather[6].temp.max-32)/1.8).toFixed(0) + "&#8451;</td><td>" + dWeather[6].wind_speed.toFixed(0) + "mph</td>")   
            $("#weather-7").html("<td>" + Date.parse("t + 7d").toString('dddd, d MMM') + "</td><td>" + dWeather[7].weather[0].main + ", " + dWeather[7].weather[0].description + "</td><td>" + ((dWeather[7].temp.min-32)/1.8).toFixed(0) + "&#8451;/" + ((dWeather[7].temp.max-32)/1.8).toFixed(0) + "&#8451;</td><td>" + dWeather[7].wind_speed.toFixed(0) + "mph</td>")
                
          }
        },
        error: function(jqXHR, textStatus, errorThrown) {
          // your error code
          console.log('error here')
        }
      }); 

      
      
      if (result.status.name == "ok") {
        // console.log(result.data)
      }
    },
    error: function(jqXHR, textStatus, errorThrown) {
      console.log('Error In Get Country Info Call');
    }  
  });
  
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
});

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