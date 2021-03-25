const update_location_button1 = document.querySelector('.update-geo');
const update_location_button2 = document.querySelector('.refresh-button');

document
    .querySelector(".add-city-text-area")
    .addEventListener('keydown', evt => {
        let textHolder = document.querySelector(".add-city-text-area");
        if (textHolder.value !== "" && evt.key === "Enter") {
            addNewCity(textHolder.value);
            textHolder.value = "";
        }
    });

document
    .querySelector(".add-city-button")
    .addEventListener('click', evt => {
            let textHolder = document.querySelector(".add-city-text-area");
            if (textHolder.value !== "") {
                addNewCity(textHolder.value);
                textHolder.value = "";
            }
        }
    );

update_location_button1.addEventListener('click', evt => getLocation(evt));
update_location_button2.addEventListener('click', evt => getLocation(evt));
const defaultCity = "Korobitsyno";
const defaultSavedCities = ['Красная поляна', 'Шерегеш'];

function getLocation() {
    const geolocation = navigator.geolocation;
    geolocation.getCurrentPosition(showLocation, errorHandler, {enableHighAccuracy: true});
}

function errorHandler(err) {
    console.error(err)
}

async function showLocation(position) {
    const json = await getWeatherJSON(position);
    if (json == null) return;

    updateInfoInBox(json, 0);
}

const MAX_SMALL_BOXES_COUNT = 4;

function updateInfoInBox(json, boxIndex) {
    if (json == null || json.name == null) {
        console.log(json);
        console.log(json.name);

        alert("error: unfortunately request hasn't been processed correctly");
        if (boxIndex > 0)
            document
                .querySelectorAll(".small-city-info-box")[boxIndex - 1].parentElement
                .remove();
        return;
    }
    if (boxIndex === 0) {
        let fb = document.querySelector('.big-city-full-box');
        fb.removeChild(document.querySelector(".big-city"));
        let newH2 = document.createElement('h2');
        newH2.classList.add("big-city");
        newH2.innerHTML = json.name;
        fb.appendChild(newH2);

        document.querySelector('.big-degrees').innerHTML =
            `<span>${json.main.temp.toFixed()}&#176;C</span>`
        document.querySelector('.big-icon').innerHTML =
            `<img src=${getIcon(json)} alt="big weather logo">`
        document.querySelector('#big-list-weather').innerHTML =
            `<li>
                    <span>Ветер</span>
                    <span>${json.wind.speed} м/с</span>
                </li>
                <li>
                    <span>Облачность</span>
                    <span>${json.weather[0].description}</span>
                </li>
                <li>
                    <span>Давление</span>
                    <span>${json.main.pressure} Па</span>
                </li>
                <li>
                    <span>Влажность</span>
                    <span>${json.main.humidity}%</span>
                </li>
                <li>
                    <span>Координаты</span>
                    <span>[${json.coord.lat.toFixed(2)}, ${json.coord.lon.toFixed(2)}]</span>
                </li>`;

    } else if (boxIndex > 0 && boxIndex <= MAX_SMALL_BOXES_COUNT) {
        let sb = document.querySelectorAll('.small-city-info-box')[boxIndex - 1];
        document.querySelectorAll(".small-city")[boxIndex - 1].innerHTML = json.name;
        document.querySelectorAll('.small-degrees')[boxIndex - 1].innerHTML =
            `<span>${json.main.temp.toFixed()}&#176;C</span>`
        document.querySelectorAll('.small-icon')[boxIndex - 1].innerHTML =
            `<img src=${getIcon(json)} alt="small weather logo">`
        document.querySelectorAll('.small-cities-list .list-weather')[boxIndex - 1].innerHTML =
            `<li>
                    <span>Ветер</span>
                    <span>${json.wind.speed} м/с</span>
                </li>
                <li>
                    <span>Облачность</span>
                    <span>${json.weather[0].description}</span>
                </li>
                <li>
                    <span>Давление</span>
                    <span>${json.main.pressure} Па</span>
                </li>
                <li>
                    <span>Влажность</span>
                    <span>${json.main.humidity}%</span>
                </li>
                <li>
                    <span>Координаты</span>
                    <span>[${json.coord.lat.toFixed(2)}, ${json.coord.lon.toFixed(2)}]</span>
                </li>`;
    }
}

const stringRequest = "https://community-open-weather-map.p.rapidapi.com/weather?lang=ru&units=metric";
const stringRequestImg = "https://openweathermap.org/img/wn/";

function getIcon(json) {
    return "img/" + getImgCode(json) + ".png";
}

function getImgCode(json) {
    let code = json.weather[0].id;

    if (code < 300) return "11d";
    else if (code < 400) return "09d";
    else if (code < 510) return "10d";
    else if (code === 511) return "13d";
    else if (code < 600) return "09d";
    else if (code < 700) return "13d";
    else if (code < 800) return "50d";
    else if (code === 800) return "01d";
    else if (code === 801) return "02d";
    else if (code === 802) return "03d";
    else if (code > 802) return "04d";
    return "02d";
}

function addCityName(str, name) {
    if (str[str.length - 1] === '?') return str + "q=" + name;
    else return str + "&q=" + name;
}

function addLon(str, lon) {
    if (str[str.length - 1] === '?') return str + "lon=" + lon;
    else return str + "&lon=" + lon;
}

function addLat(str, lat) {
    if (str[str.length - 1] === '?') return str + "lat=" + lat;
    else return str + "&lat=" + lat;
}

async function getWeatherJSON(position, cityName) {
    console.log("requested city is " + cityName);
    let request = stringRequest;
    if (cityName != null) {
        request = addCityName(request, cityName);
    } else if (position != null) {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        request = addLon(addLat(request, lat), lon);
    } else {
        console.log("error: unknown format of a requested location");
        console.log("requested position: " + position);
        console.log("requested city: " + cityName);
        return null;
    }

    let data = await fetch(request, {
        "method": "GET",
        "headers": {
            "x-rapidapi-key": "f2179e951emsh65f3421070db832p184eecjsn1761d1e22e7c",
            "x-rapidapi-host": "community-open-weather-map.p.rapidapi.com"
        }
    })

    if (data.ok) {
        return await data.json();
    } else {
        console.error("error: " + data.status);
    }
    return null;
}

document.addEventListener('DOMContentLoaded', () => {
    setDefaultWeather();
    let data = localStorage.getItem('0');
    if (data == null || data.length === 0) {
        localStorage.setItem('0', defaultSavedCities.map(x => x.toLowerCase()).join('_'));
    }
    let cities = localStorage.getItem('0').split('_');
    localStorage.setItem('0', "");
    for (let i = 0; i < cities.length; ++i) {
        addNewCity(cities[i]);
    }
    assignListeners();
});

async function setDefaultWeather() {
    const json = await getWeatherJSON(null, defaultCity);
    if (json == null) {
        console.log("error: json is null");
        return;
    }
    updateInfoInBox(json, 0);
}

function assignListeners() {
    let boxes = document.querySelectorAll(".cancel-button");
    boxes.forEach((elem, idx) => {
        elem.addEventListener('click', () => {
            let cityName = elem.parentElement.firstChild.nextSibling.textContent;
            removeCityFromStorage(cityName);
            console.log(localStorage.getItem('0'));
            elem.parentElement.parentElement.remove();
        })
    })
}

async function addNewCity(name) {
    name = name.toLowerCase();
    let small_cities = document.querySelectorAll(".small-city");
    let idx = small_cities == null ? 1 : small_cities.length + 1;
    if (idx > MAX_SMALL_BOXES_COUNT) {
        alert("error: not enough space, delete 1 saved city");
        return;
    }
    let cities = localStorage.getItem('0');
    localStorage.removeItem('0');
    if (cities.length === 0)
        localStorage.setItem('0', name);
    else localStorage.setItem('0', cities + "_" + name);
    console.log(localStorage.getItem("0"));

    let newBox = document.createElement('li');
    newBox.innerHTML =
        ` <div class="small-city-info-box">
                    <h3 class="small-city">Moscow</h3>
                    <div class="small-icon">
                        <img src="img/weather_logo_1.png" alt="small weather logo">
                    </div>
                    <div class="small-degrees">
                        <span>8&#176;C</span>
                    </div>
                    <button class="cancel-button">&#10005;</button>
                </div>
                <ul class="list-weather">
                    <li>
                        <span>Ветер</span>
                        <span>Moderate breeze, 6.0 m/s, North-northwest</span>
                    </li>
                    <li>
                        <span>Облачность</span>
                        <span>Broken clouds</span>
                    </li>
                    <li>
                        <span>Давление</span>
                        <span>1013 Па</span>
                    </li>
                    <li>
                        <span>Влажность</span>
                        <span>52%</span>
                    </li>
                    <li>
                        <span>Координаты</span>
                        <span>[59.88, 30.42]</span>
                    </li>
                </ul>`;
    document.querySelector('.small-cities-list').appendChild(newBox);
    let data = await getWeatherJSON(null, name);
    if (data == null) {
        document.querySelector('.small-cities-list').removeChild(newBox);
        alert("Мы не смогли найти информацию по вашему запросу. Попробуйте еще раз.");
        removeCityFromStorage(name);
        return;
    }
    updateInfoInBox(data, idx);
    assignListeners();
}

function removeCityFromStorage(name) {
    name = name.toLowerCase();
    let old = localStorage.getItem('0');
    localStorage.removeItem('0');
    localStorage.setItem('0',
        old.replace(name + "_", "")
            .replace("_" + name, "")
            .replace(name, ""));
}