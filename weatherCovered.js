"use strict";
let input_search = document.getElementById("search_input");
let submit_search =document.getElementById("submit");
let coordinates = document.getElementById('coordinates');
// accessing the map using key
let accessToken =mapboxgl.accessToken = map_box_key;
accessToken = mapboxgl.accessToken;
// modifying map with center and zoom
let weatherMap = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v12',
    center: [-97.720569, 31.084211],
    zoom: 5
});
let popup = new mapboxgl.Popup();
// adding marker on map
let marker = new mapboxgl.Marker({
    draggable: true
})
    .setLngLat([-97.720569, 31.084211])
    .addTo(weatherMap)
 .setPopup(new mapboxgl.Popup());


function weatherInfo(lat, lon) {
    $.get("http://api.openweathermap.org/data/2.5/forecast", {
        APPID: weather_map_key,
        lat: lat,
        lon: lon,
        units: "imperial"
    })
        .done(function (data) {
            console.log('5 day forecast', data);
            let days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            let months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

            for (let i = 0; i < 5; i++) {  //for 5 days
                let dayIndex = i * 8;      //3 hrs per index of array
                let currentData = data.list[dayIndex];
                let todayDate = new Date(currentData.dt * 1000);
                let currentDay = days[todayDate.getDay()];
                let currentMonth = months[todayDate.getMonth()];

                // Map weather condition to Weather Icons class
                let weatherIconClass = mapWeatherToIconClass(currentData.weather[0].main);

                let cardHTML = `
              <div class="five_days">
                  <div class="card-date">${currentDay}, ${currentMonth} ${todayDate.getDate()}</div>
                  <img src="${weatherIconClass}"/>
                  <div class="card-temperature">${currentData.main.temp_max} °F / ${currentData.main.temp_min} °F</div>
                  <div class="card-city">${data.city.name}, ${data.city.country}</div>
                  <div class="card-description">Description: ${currentData.weather[0].description}</div>
                  <div class="card-humidity">Humidity: ${currentData.main.humidity}%</div>
                  <div class="card-wind">Wind: ${currentData.wind.gust}</div>
                  <div class="card-pressure">Pressure: ${currentData.main.pressure}</div>
              </div>
            `;
                // $(`#card-${i + 1}`).html(cardHTML);
                $(`#card-${i + 1}`).html(cardHTML);
                // marker.setPopup(popup).togglePopup();
            }

            $("#currentCity").html(`Current Location: ${data.city.name}, ${data.city.country}`);
        });
}


//Weather info based on lng and lat
function updateWeatherInfo(lngLat) {
    let lat = lngLat.lat;
    let lon = lngLat.lng;
    weatherInfo(lat, lon);
}
weatherInfo( 31.084211, -97.720569);
// Using onDragEnd function in order to have draggable marker and print lon and lat value on webpage
function onDragEnd() {
    let lngLat = marker.getLngLat();
    updateWeatherInfo(lngLat);
}

marker.on('dragend', onDragEnd);

//weather info based on search
function searchLocation(event) {
    event.preventDefault(); // Prevent form submission from refreshing the page

    let input = input_search.value;
    console.log("input is:" + input);

    //Remove the existing marker if it exists
    if (marker) {
        marker.remove();
    }

    $.get("https://api.openweathermap.org/data/2.5/forecast", {
        APPID: weather_map_key,
        q: input,
        zip: input,
        units: "imperial"
    })
        .done(function (data) {
            console.log('5 day forecast', data);
            console.log(data.city.coord.lat);
            console.log(data.city.coord.lon);
            geocode(input, accessToken).then(function (result) {
                console.log(result);
                var newMarker = new mapboxgl.Marker({
                    draggable: true
                }).setLngLat(result);
                newMarker.addTo(weatherMap);
                weatherMap.panTo({ lon: data.city.coord.lon, lat: data.city.coord.lat }, { duration: 5000 });

                // Update the marker variable to the new marker
                marker = newMarker;

                // Make the marker draggable
                marker.on('dragend', function () {
                    onDragEnd(marker.getLngLat());
                });

                updateWeatherInfo(marker.getLngLat());
            });

        });
}


submit_search.addEventListener('click', searchLocation);

weatherMap.on('click', function (e) {
    // Remove the existing marker if it exists
    if (marker) {
        marker.remove();
    }
    // Create a new marker at the clicked coordinates with draggable option
    var newMarker = new mapboxgl.Marker({
        draggable: true
    }).setLngLat(e.lngLat);

    newMarker.addTo(weatherMap);

    // Update the marker variable to the new marker
    marker = newMarker;

    // Make the marker draggable
    marker.on('dragend', function () {
        onDragEnd(marker.getLngLat());
    });

    // Add a popup to the marker
    let popup = new mapboxgl.Popup()
        .setHTML('Click me for more info!')
        .addTo(weatherMap);

    // Add a click event listener to the marker to open the popup
    marker.getElement().addEventListener('click', function () {
        popup.addTo(weatherMap);
    });

    // Fetch weather information for the clicked location
    updateWeatherInfo(marker.getLngLat());
});




// Function to map weather conditions to Weather Icons classes
function mapWeatherToIconClass(weatherCondition) {
    switch (weatherCondition) {
        case "Clouds":
            return "img/clouds.png"; // Example class from Weather Icons
        case "Clear":
            return "img/clear.png";
        case "Drizzle":
            return "img/drizzle.png";
        case "Mist":
            return "img/mist.png";
        case "Rain":
            return "img/rain.png";
        case "Snow":
            return "img/snow.png";
        default:
            return "img/clouds.png"; // Default icon class for unknown conditions
    }
}