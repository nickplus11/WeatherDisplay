import {assignListeners} from "/public/scripts/events";

export const serverURL = "http://localhost:3000";
export const defaultCity = "Korobitsyno";

export function getLocation() {
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

export function showLocation(position) {
    requestWeather(position, 0, null);
}

function requestWeather(position, idx, newBox) {
    let requestURL;
    let result = {};
    result.status = 'ok';

    if (position.coords !== undefined && position.coords.latitude !== undefined && position.coords.longitude !== undefined) {
        requestURL = `${serverURL}/weather/coordinates?lat=${position.coords.latitude}&lon=${position.coords.longitude}`;
    } else if (position.name !== undefined && position.name.length > 0) {
        requestURL = `${serverURL}/weather/city?q=${position.name}`;
    } else {
        console.log('1');
        result.status = 'error';
        result.reason = 'not valid position';
        return result;
    }

    let out = {};
    fetch(requestURL)
        .then(res => {
            if (!res.ok) {
                throw new Error("failed to get API data");
            }
            return res.json();
        })
        .then(data => {
            result.status = 'ok';
            result.json = data;
            onSuccess(result, idx, newBox);
        })
        .catch(err => {
            result.status = 'error';
            result.reason = err;
            onFailure(result, idx, newBox);
        });
    return out;
}

function onSuccess(data, idx, newBox) {
    updateInfoInBox(data.json, idx);
    hideLoader(idx);
    assignListeners();
    if (idx > 0) addCityToSaved(data.json.name);
}

function onFailure(data, idx, newBox) {
    document.querySelector('.small-cities-list').removeChild(newBox);
    alert("Мы не смогли найти информацию по вашему запросу. Попробуйте еще раз.");
    hideLoader(idx);
}

const MAX_SMALL_BOXES_COUNT = 100;

export function updateInfoInBox(json, boxIndex) {
    if (json === undefined || json.name === undefined) {
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

export function setDefaultWeather() {
    let position = {};
    position.name = defaultCity;
    requestWeather(position, 0, null);
    getSaved();
}

const dataLoadingInfoString = "Информация загружается";

export function addNewCity(name) {
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
    let position = {};
    position.name = name;
    requestWeather(position, idx, newBox);
}

const savedURL = `${serverURL}/favorites`;

function getSaved() {
    fetch(savedURL)
        .then(res => {
            if (!res.ok) {
                throw new Error();
            }
            return res.json();
        })
        .then(data => {
            console.log(data);
            if(data.favorites !== undefined && data.favorites.length > 0)
                data.favorites.forEach(x => addNewCity(x.name));
        })
        .catch(err => {
            console.log("Failed to load favorites");
        });
}

export function removeCityFromSaved(name) {
    fetch(savedURL, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({name})
    }).then(res => {
        if (!res.ok) {
            throw new Error();
        }
    }).catch(err => {
        console.error("Failed to delete city from saved", err);
    });
}

function addCityToSaved(name) {
    fetch(savedURL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({name})
    }).then(res => {
        if (!res.ok) {
            throw new Error();
        }
    }).catch(err => {
        console.error("Failed to add new city to saved", err);
    });
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

        if (degrees === undefined) return;

        degrees.classList.remove("mini-loader");

        document.querySelectorAll(".small-degrees span")[idx - 1].hidden = false;
    }
}