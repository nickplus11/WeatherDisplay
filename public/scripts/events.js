import {
    addNewCity, setDefaultWeather, getLocation,
    removeCityFromSaved
} from "/public/scripts/logic";

const update_location_button1 = document.querySelector('.update-geo');
const update_location_button2 = document.querySelector('.refresh-button');

document
    .querySelector(".add-city-text-area")
    .addEventListener('keydown', evt => {
        let textHolder = document.querySelector(".add-city-text-area");
        if (textHolder.value !== "" && evt.key === "Enter") {
            addNewCity(textHolder.value, true);
            textHolder.value = "";
        }
    });

document
    .querySelector(".add-city-button")
    .addEventListener('click', evt => {
            let textHolder = document.querySelector(".add-city-text-area");
            if (textHolder.value !== "") {
                addNewCity(textHolder.value, true);
                textHolder.value = "";
            }
        }
    );

update_location_button1
    .addEventListener('click', evt => getLocation(evt));
update_location_button2
    .addEventListener('click', evt => getLocation(evt));


document.addEventListener('DOMContentLoaded', () => {
    setDefaultWeather();
    assignListeners();
});

export function assignListeners() {
    let boxes = document.querySelectorAll(".cancel-button");
    boxes.forEach((elem, idx) => {
        elem.addEventListener('click', () => {
            let cityName = elem.parentElement.firstChild.nextSibling.textContent;
            removeCityFromSaved(cityName);
            elem.parentElement.parentElement.remove();
        })
    })
}
