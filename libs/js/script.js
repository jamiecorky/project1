$(window).on("load", function () {
  if ($("#preloader").length) {
    $("#preloader").delay(1000).fadeOut('slow', function () {
      $(this).remove();
    });
  }
});

$(document).ready(function () {
  // variables
  // Global variables
  let geojson;
  let myGeoJSON = [];
  let nameSelected = [];
  let countryInfo = [];
  let capitalMark = {};
  let cityMark = {};
  let cityGroup;
  let wikiGroup;
  let camGroup;
  let airportGroup;

  // functions
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

  function animateButton(targetclass) {
    $(targetclass).parent().parent().hover(
      function () {
        $(targetclass).addClass("fa-bounce")
      },
      function () {
        $(targetclass).removeClass("fa-bounce")
      }
    )
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

  function markerOnClick(e) {
    var latLngs = [e.target.getLatLng()];
    var markerBounds = L.latLngBounds(latLngs);
    map.fitBounds(markerBounds);
    map.setZoom(15);
  }

  // markers
  const cityIcon = L.ExtraMarkers.icon({
    icon: 'fa-solid fa-city',
    markerColor: 'pink',
    shape: 'penta',
    prefix: 'fa'
  });

  const wikiIcon = L.ExtraMarkers.icon({
    icon: 'fa-brands fa-wikipedia-w',
    markerColor: 'cyan',
    shape: 'square',
    prefix: 'fa'
  });

  const airportIcon = L.ExtraMarkers.icon({
    icon: 'fa-solid fa-plane-departure',
    markerColor: 'green',
    shape: 'star',
    prefix: 'fa'
  });

  const camIcon = L.ExtraMarkers.icon({
    icon: 'fa-solid fa-camera',
    markerColor: 'orange',
    shape: 'circle',
    prefix: 'fa'
  });

  const accessToken = 'cOYvUkIr2QTC1XUq4cllxAvdITUWUPMEJp9b84EhqypFuJabteMQtGFND8eBRj8n';

  // Map tiles 
  const streets = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href=https://www.openstreetmap.org/copyright>OpenStreetMap</a> contributors'
  });

  const satellite = L.tileLayer('https://api.maptiler.com/tiles/satellite-v2/{z}/{x}/{y}.jpg?key=vT8D4gm5ejB3f5qXd1Ap', {
    tileSize: 512,
    zoomOffset: -1,
    minZoom: 1,
    attribution: '<a href=https://www.maptiler.com/copyright/ target="_blank">&copy; MapTiler</a><a href=https://www.openstreetmap.org/copyright target="_blank"> &copy; OpenStreetMap</a>',
    crossOrigin: true
  }
  );

  const baseMaps = {
    "Satellite": satellite,
    "Streets": streets
  };

  // const corner1 = L.latLng(-90, -200);
  // const corner2 = L.latLng(90, 200);
  // const bounds = L.latLngBounds(corner1, corner2);

  const map = L.map('map', {
    layers: [streets],
    minZoom: 2,
    //maxBoundsViscosity: 1,
    //maxBounds: bounds
  });

  let mapControl = L.control.layers(baseMaps).addTo(map);




  const countryButton = L.easyButton('fa-solid fa-info fa-lg', function (btn, map) {
    $('#country-modal').modal('show');
  }).addTo(map);

  animateButton(".fa-info");

  const weatherButton = L.easyButton('fa-solid fa-cloud-sun-rain fa-lg', function (btn, map) {
    $('#weather-modal').modal('show');
  }).addTo(map);

  animateButton(".fa-cloud-sun-rain");

  const currencyButton = L.easyButton('fa-solid fa-coins fa-lg', function (btn, map) {
    $('#currency-modal').modal('show');
  }).addTo(map);

  animateButton(".fa-coins");

  const covidButton = L.easyButton('fa-solid fa-virus-covid fa-lg', function (btn, map) {
    $('#covid-modal').modal('show');
  }).addTo(map);

  animateButton(".fa-virus-covid");

  const newsButton = L.easyButton('fa-solid fa-newspaper fa-lg', function (btn, map) {
    $('#news-modal').modal('show');
  }).addTo(map);

  animateButton(".fa-newspaper");

  const holidaysButton = L.easyButton('fa-solid fa-calendar-plus fa-lg', function (btn, map) {
    $('#holidays-modal').modal('show');
  }).addTo(map);

  animateButton(".fa-calendar-plus");

  // Adds countries from GeoJSON to select menu - fixes some naming errors also
  $.ajax({
    url: "libs/php/getCountryForSelect.php",
    type: 'GET',
    dataType: 'json',
    success: function (result) {
      if (result.status.name == "ok") {
        //console.log('populate select success');
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
      const userPosition = {};
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
          //console.log("user gave location");
          userPosition.lat = position.coords.latitude;
          userPosition.lon = position.coords.longitude;
          $.ajax({
            url: "libs/php/getCurrentCountryCode.php",
            type: 'POST',
            dataType: 'json',
            data: {
              lat: userPosition.lat,
              lng: userPosition.lon
            },
            success: function (result) {
              if (result.status.name == "ok") {
                //console.log('change select to location success')
                $("#country-select").val(result.data.countryCode).change();
              }
            },
            error: function (jqXHR, textStatus, errorThrown) {
              //console.log('your lat lng error');
            }
          });
        }, function () {
          //console.log("user refused location");
          userPosition.lat = 51.509865;
          userPosition.lon = -0.118092;
          $.ajax({
            url: "libs/php/getCurrentCountryCode.php",
            type: 'POST',
            dataType: 'json',
            data: {
              lat: userPosition.lat,
              lng: userPosition.lon
            },
            success: function (result) {
              if (result.status.name == "ok") {
                //console.log('change select to location success')
                $("#country-select").val(result.data.countryCode).change();
              }
            },
            error: function (jqXHR, textStatus, errorThrown) {
              //console.log('your lat lng error');
              //console.log(jqXHR);
            }
          });
        });
      } else {
        alert("Geolocation not supported by your browser");
      }
    },
    error: function (jqXHR, textStatus, errorThrown) {
      //console.log(jqXHR);
    }
  });

  function removeCities() {
    if (cityGroup !== undefined) {
      cityGroup.clearLayers();
      mapControl.removeLayer(cityGroup)
    }
  }

  function addCities() {
    cityGroup = L.markerClusterGroup();
  }

  // Changes the boundary on the map to match the selected location
  $('#country-select').change(function () {
    //console.log(addCities);
    const countryName = $('#country-select option:selected').text();
    const countryVal = $('#country-select option:selected').val();

    // Creates the geoJSON borders on the map when the country is selected
    $.ajax({
      url: "libs/php/getCountryBorders.php",
      type: 'POST',
      dataType: 'json',
      data: {
        name: countryName,
        value: countryVal
      },
      success: function (result) {
        if (result.status.name == "ok") {
          // console.log(countryVal);
          // console.log(result);
          // myGeoJSON.push(result.returnBorder[0]);
          // nameSelected.push(result.returnName);
          if (geojson) {
            geojson.clearLayers();
          }
          geojson = L.geoJson(result.returnBorder[0], {
            style: style
          }).addTo(map);
          map.fitBounds(geojson.getBounds());
        }
      },
      error: function (jqXHR, textStatus, errorThrown) {
        //console.log(jqXHR, textStatus, errorThrown);
      }
    });

    $.ajax({
      url: "libs/php/getCovidData.php",
      type: 'POST',
      dataType: 'json',
      data: { code: countryVal },
      success: function (covid) {
        if (covid.status.name == "ok") {
          //console.log('covid data success')
          //console.log(covid)

          $("#covid-header").html(countryName + " Covid-19 Statistics");
          $("#covid-graph").append(`<img id=covid-img src='${covid.data}'>`);
          // $("#confirmed-data").html("<td><i class='fa-solid fa-chart-line'></i></td><td>Confirmed Cases</td><td>" + covid.data.confirmed.toLocaleString() + "</td>")
          // $("#critical-data").html("<td><i class='fa-solid fa-bed-pulse'></i></td><td>Critical Cases</td><td>" + covid.data.critical.toLocaleString() + "</td>")
          // $("#deaths-data").html("<td><i class='fa-solid fa-hospital'></i></td><td>Total Deaths</td><td>" + covid.data.deaths.toLocaleString() + "</td>")
          // $("#recovered-data").html("<td><i class='fa-solid fa-heart-pulse'></i></td><td>Total Recovered</td><td>" + covid.data.recovered.toLocaleString() + "</td>")

        }
      },
      error: function (jqXHR, textStatus, errorThrown) {
        //console.log('covid error');
        //console.log(jqXHR);
      }
    });

    $.ajax({
      url: "libs/php/getNews.php",
      type: 'POST',
      dataType: 'json',
      data: { code: countryVal },
      success: function (news) {
        if (news.status.name == "ok") {
          nStory = news.data.articles;
          //console.log(news)
          $("#news-header").html(countryName + " Top News");

          for (let i = 0; i < 5; i++) {
            $("#holidays-header").html(countryName + " Public Holiday Dates");
            $("#news-story-" + [i] + "-img").html("<td><img class='rounded img-fluid' src ='" + (nStory[i].urlToImage ? nStory[i].urlToImage : "libs/img/news.jpg") + "'></td>")
            $("#news-story-" + [i] + "-description").html("<td>" + nStory[i].title + "<br><a href='" + nStory[i].url + "' target = '_blank'>Read More...</a></td>");
          }
        }
      },
      error: function (jqXHR, textStatus, errorThrown) {
        //console.log(jqXHR, textStatus, errorThrown);
      }
    });

    $.ajax({
      url: "libs/php/getHolidays.php",
      type: 'POST',
      dataType: 'json',
      data: { code: countryVal },
      success: function (holidays) {
        if (holidays.status.name == "ok") {
          //console.log(holidays)

          for (let i = 0; i < holidays.data.length; i++) {
            $("#holidays-header").html(countryName + " Public Holiday Dates");
            $("#hol-row-" + [i]).html("<td>" + holidays.data[i].localName + "</td><td>" + Date.parse(holidays.data[i].date).toString("MMMM dS") + "</td>")
          }
        }
      },
      error: function (jqXHR, textStatus, errorThrown) {
        //console.log(jqXHR, textStatus, errorThrown);
      }
    });

    $.ajax({
      url: "libs/php/getWebcams.php",
      type: 'POST',
      dataType: 'json',
      data: { code: countryVal },
      success: function (cams) {
        if (cams.status.name == "ok") {
          camsData = cams.data.result.webcams;
          if (camGroup) {
            camGroup.clearLayers();
            mapControl.removeLayer(camGroup)
          }

          camGroup = L.markerClusterGroup();
          mapControl.addOverlay(camGroup, "Webcams");

          let markers = [];
          for (let i = 0; i < camsData.length; i++) {
            markers.push(L.marker([camsData[i].location.latitude, camsData[i].location.longitude], { icon: camIcon }).on('click', markerOnClick)
              .bindPopup("<b>" + camsData[i].title + "</b><br><img id='cam-img' src='" + camsData[i].image.current.thumbnail + "'>"));
          }

          camGroup.addLayers(markers);
          map.addLayer(camGroup);
        }
      },
      error: function (jqXHR, textStatus, errorThrown) {
        //console.log(jqXHR, textStatus, errorThrown);
      }
    });

    $.ajax({
      url: "libs/php/getAirports.php",
      type: 'POST',
      dataType: 'json',
      data: { code: countryVal },
      success: function (airports) {
        if (airports.status.name == "ok") {
          airportData = airports.data.airports;
          // console.log(airports)
          if (airportGroup) {
            airportGroup.clearLayers();
            mapControl.removeLayer(airportGroup)
          }
          airportGroup = L.markerClusterGroup();
          mapControl.addOverlay(airportGroup, "Airports");

          let markers = [];
          for (let i = 0; i < airportData.length; i++) {
            markers.push(L.marker([airportData[i].latitude, airportData[i].longitude], { icon: airportIcon }).on('click', markerOnClick)
              .bindPopup("<b>" + airportData[i].name + "</b><br>"));
          }

          airportGroup.addLayers(markers);
          map.addLayer(airportGroup);
        }
      },
      error: function (jqXHR, textStatus, errorThrown) {
        //console.log(jqXHR, textStatus, errorThrown);
      }
    });

    $.ajax({
      url: "libs/php/getCountryBoundingBox.php",
      type: 'POST',
      dataType: 'json',
      data: {
        country: $('#country-select').val(),
      },
      success: function (border) {
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
            success: function (result) {
              if (result.status.name == "ok") {
                if (wikiGroup) {
                  wikiGroup.clearLayers();
                  mapControl.removeLayer(wikiGroup)
                }
                wikiGroup = L.markerClusterGroup();
                mapControl.addOverlay(wikiGroup, "Wikipedia");

                let markers = [];
                for (let i = 0; i < result.data.length; i++) {
                  markers.push(L.marker([result.data[i].lat, result.data[i].lng], { icon: wikiIcon }).on('click', markerOnClick)
                    .bindPopup("<b>" + result.data[i].title + "</b><br>" + result.data[i].summary + " <a href='https://" + result.data[i].wikipediaUrl + "' target='blank'>Read more...</a>"));
                }

                wikiGroup.addLayers(markers);
                map.addLayer(wikiGroup);
              }
            },
            error: function (jqXHR, textStatus, errorThrown) {
              //console.log(jqXHR, textStatus, errorThrown)
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
            success: function (cities) {
              if (cities.status.name == "ok") {
                removeCities();
                addCities();
                mapControl.addOverlay(cityGroup, "Cities");

                let markers = []
                for (let i = 0; i < cities.data.length; i++) {
                  if (cities.data[i].countrycode == $('#country-select').val()) {
                    markers.push(L.marker([cities.data[i].lat, cities.data[i].lng], { icon: cityIcon }).on('click', markerOnClick)
                      .bindPopup("<b>Welcome to " + cities.data[i].name + "</b><br>Population: " + cities.data[i].population + " <a href='https://" + cities.data[i].wikipedia + "' target='blank'>Read more...</a>"));
                  }
                }

                cityGroup.addLayers(markers);
                map.addLayer(cityGroup)
              }
            },
            error: function (jqXHR, textStatus, errorThrown) {
              //console.log(jqXHR, textStatus, errorThrown)
            }
          });
        }
      },
      error: function (jqXHR, textStatus, errorThrown) {
        //console.log(jqXHR, textStatus, errorThrown)
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
      success: function (result) {
        //console.log('Get Country Info Call Success')
        const populationMil = (result.data.population / 1000000).toFixed(1);
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
          success: function (exchange) {
            if (exchange.status.name == "ok") {
              //console.log("Exchange Call Success");
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
          error: function (jqXHR, textStatus, errorThrown) {
            //console.log(jqXHR, textStatus, errorThrown);
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
          success: function (weather) {
            if (result.status.name == "ok") {
              const dWeather = weather.data.daily;

              $("#weather-location").html(result.data.capital + " 7 Day Weather Forecast");
              $("#weather-key").html("<td>Day</td><td>Weather</td><td>Min/Max</td><td>Wind</td></b>")
              $("#weather-0").html("<td>Today" + Date.parse("t").toString(', d MMM') + "</td><td>" + dWeather[0].weather[0].main + ", " + dWeather[0].weather[0].description + "</td><td>" + ((dWeather[0].temp.min - 32) / 1.8).toFixed(0) + "&#8451;/" + ((dWeather[0].temp.max - 32) / 1.8).toFixed(0) + "&#8451;</td><td>" + dWeather[0].wind_speed.toFixed(0) + "mph</td>")
              for (let i = 1; i < dWeather.length; i++) {
                $("#weather-" + [i]).html("<td>" + Date.parse("t + " + [i] + "d").toString('dddd, d MMM') + "</td><td>" + dWeather[i].weather[0].main + ", " + dWeather[i].weather[0].description + "</td><td>" + ((dWeather[i].temp.min - 32) / 1.8).toFixed(0) + "&#8451;/" + ((dWeather[i].temp.max - 32) / 1.8).toFixed(0) + "&#8451;</td><td>" + dWeather[i].wind_speed.toFixed(0) + "mph</td>")
              }
            }
          },
          error: function (jqXHR, textStatus, errorThrown) {
            //console.log('error here')
          }
        });

        if (result.status.name == "ok") {
          //console.log(result.data)
        }
      },
      error: function (jqXHR, textStatus, errorThrown) {
        //console.log(jqXHR, textStatus, errorThrown);
      }
    });
  });

  // Styles
  const win = $(window);
  if (win.width() <= 575) {
    $('.leaflet-control').css({ 'top': '95px' });
    $('.leaflet-control-attribution').css({ 'top': '0', 'text-align': 'left' });

  } else {
    $('.leaflet-control').css({ 'top': '55px' });
    $('.leaflet-control-attribution').css({ 'top': '0', 'text-align': 'left' });
  }
});

$(window).on('resize', function () {
  const win = $(this); //this = window
  if (win.width() <= 575) {
    $('.leaflet-control').css({ 'top': '95px' });
    $('.leaflet-control-attribution').css({ 'top': '0', 'text-align': 'left' });
  }
  if (win.width() > 575) {
    $('.leaflet-control').css({ 'top': '55px' });
    $('.leaflet-control-attribution').css({ 'top': '0', 'text-align': 'left' });
  }
});
