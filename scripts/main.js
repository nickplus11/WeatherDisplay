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

update_location_button1
    .addEventListener('click', evt => getLocation(evt));
update_location_button2
    .addEventListener('click', evt => getLocation(evt));

const defaultCity = "Korobitsyno";
const defaultSavedCities = [];

function getLocation() {
    showLoader(0);
    const geolocation = navigator.geolocation;
    geolocation.getCurrentPosition(showLocation, errorHandler, {enableHighAccuracy: true});
}

function errorHandler(err) {
    console.error(err)
    hideLoader(0);
    alert("Не удалось определить ваше местонахождение. Попробуйте позже.");
    setDefaultWeather();
}

async function showLocation(position) {
    console.log("position " + position);
    const json = await getWeatherJSON(position);
    if (json != null) {
        updateInfoInBox(json, 0);
    }
    hideLoader(0);
}

const MAX_SMALL_BOXES_COUNT = 100;

function updateInfoInBox(json, boxIndex) {
    if (json == null || json.name == null) {

        alert("К сожалению, что-то пошло не так. Попробуйте снова.");
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

        let d = document.querySelector('.big-degrees');
        d.innerHTML = `<span>${json.main.temp.toFixed()}&#176;C</span>`;
        //document.querySelector('.big-degrees span').hidden = true;

        let i = document.querySelector('.big-icon');
        i.innerHTML = `<img src=${getIcon(json)} alt="big weather logo">`;
        //document.querySelector('.big-icon img').hidden = true;

        document.querySelector('#big-list-weather').innerHTML =
            `<li>
                    <span>Ветер</span>
                    <span class="big-info">${json.wind.speed} м/с</span>
                </li>
                <li>
                    <span>Облачность</span>
                    <span class="big-info">${json.weather[0].description}</span>
                </li>
                <li>
                    <span>Давление</span>
                    <span class="big-info">${json.main.pressure} Па</span>
                </li>
                <li>
                    <span>Влажность</span>
                    <span class="big-info">${json.main.humidity}%</span>
                </li>
                <li>
                    <span>Координаты</span>
                    <span class="big-info">[${json.coord.lat.toFixed(2)}, ${json.coord.lon.toFixed(2)}]</span>
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
            //"x-rapidapi-key": "f2179e951emsh65f3421070db832p184eecjsn1761d1e22e7c",
            //"x-rapidapi-key": "f494fb3154msh0913796c0863d67p15ea29jsndfcee442a36e",
            "x-rapidapi-key": "3cb78950cemsh2902c9b450e5005p166e7ejsn6fed8248b622",
            "x-rapidapi-host": "community-open-weather-map.p.rapidapi.com"
        }
    }).catch(() => {
        return null;
    });

    if (data == null) return null;
    if (data.status == 429) {
        alert('Слишком много запросов. Попробуйте повторить позже.');
    }
    if (data.ok) {
        console.log("data is ok. city " + cityName);
        return await data.json();
    } else {
        console.error("error: " + data.status);
    }
    return null;
}

document.addEventListener('DOMContentLoaded', () => {
    setDefaultWeather();
    let data = localStorage.getItem('0');
    if (defaultSavedCities.length > 0) {
        if (data == null || data.length === 0) {
            localStorage.setItem('0', defaultSavedCities.map(x => x.toLowerCase()).join('_'));
        }
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
            removeCityFromStorage(cityName.toLowerCase());
            console.log(localStorage.getItem('0'));
            elem.parentElement.parentElement.remove();
        })
    })
}

const dataLoadingInfoString = "Информация загружается";

async function addNewCity(name) {
    if (name == null || name.length === 0) return;
    let small_cities = document.querySelectorAll(".small-city");
    let idx = small_cities == null ? 1 : small_cities.length + 1;
    if (idx > MAX_SMALL_BOXES_COUNT) {
        alert('Недостаточно места. Сократите список избранных городов.');
        return;
    }

    let newBox = document.createElement('li');
    newBox.innerHTML =
        ` <div class="small-city-info-box">
                    <h3 class="small-city">${name}</h3>
                    <div class="small-icon">
                        <img src="img/weather_logo_1.png" alt="small weather logo">
                    </div>
                    <div class="small-degrees">
                        <span></span>
                    </div>
                    <button class="cancel-button">&#10005;</button>
                </div>
                <ul class="list-weather">
                    <li>
                        <span>Ветер</span>
                        <span>${dataLoadingInfoString}</span>
                    </li>
                    <li>
                        <span>Облачность</span>
                        <span>${dataLoadingInfoString}</span>
                    </li>
                    <li>
                        <span>Давление</span>
                        <span>${dataLoadingInfoString}</span>
                    </li>
                    <li>
                        <span>Влажность</span>
                        <span>${dataLoadingInfoString}</span>
                    </li>
                    <li>
                        <span>Координаты</span>
                        <span>${dataLoadingInfoString}</span>
                    </li>
                </ul>`;

    document.querySelector('.small-cities-list').appendChild(newBox);
    showLoader(idx);
    let data = await getWeatherJSON(null, name);
    if (data == null) {
        document.querySelector('.small-cities-list').removeChild(newBox);
        alert("Мы не смогли найти информацию по вашему запросу. Попробуйте еще раз.");
        hideLoader(idx);
        return;
    }

    let cities = localStorage.getItem('0');
    localStorage.removeItem('0');
    if (cities.length === 0)
        localStorage.setItem('0', data.name.toLowerCase());
    else localStorage.setItem('0', cities + "_" + data.name.toLowerCase());
    console.log(localStorage.getItem("0"));

    updateInfoInBox(data, idx);
    hideLoader(idx);
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

function showLoader(idx) {
    if (idx === 0) {
        console.log("show big loader");
        //let icon = document.querySelector(".big-icon");
        let degrees = document.querySelector(".big-degrees");

        let infos = document.querySelectorAll(".big-info");
        infos.forEach(x => x.innerHTML = `${dataLoadingInfoString}`);

        //document.querySelector(".big-icon img").hidden = true;
        document.querySelector(".big-degrees span").hidden = true;

        // icon.classList.add("loader");
        degrees.classList.add("loader");
    } else {
        //let icon = document.querySelectorAll(".small-icon")[idx-1];
        let degrees = document.querySelectorAll(".small-degrees")[idx - 1];

        document.querySelectorAll(".small-degrees span")[idx - 1].hidden = true;

        degrees.classList.add("mini-loader");
    }
}

function hideLoader(idx) {
    if (idx === 0) {
        console.log("hide big loader");
        //let icon = document.querySelector(".big-icon");
        let degrees = document.querySelector(".big-degrees");

        let infos = document.querySelectorAll(".big-info");
        infos.forEach(x => {
            if (x.innerHTML === `${dataLoadingInfoString}`) {
                x.innerHTML = "";
            }
        });

        //icon.classList.remove("loader");
        degrees.classList.remove("loader");

        //document.querySelector(".big-icon img").hidden = false;
        document.querySelector(".big-degrees span").hidden = false;
    } else {
        //let icon = document.querySelectorAll(".small-icon")[idx-1];
        let degrees = document.querySelectorAll(".small-degrees")[idx - 1];

        degrees.classList.remove("mini-loader");

        document.querySelectorAll(".small-degrees span")[idx - 1].hidden = false;
    }
}