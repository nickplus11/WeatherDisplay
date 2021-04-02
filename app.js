const express = require("express");
const fetch = require("node-fetch");
const {MongoClient} = require("mongodb");
const cors = require("cors");
const mongoURL = "mongodb://localhost:27017/";
const mongoClient = MongoClient(mongoURL, {useNewUrlParser: true, useUnifiedTopology: true});

let app = express();
app.use(cors());
app.use(express.static("public"));
app.use(express.json());

app.get("/public/scripts/events", (req, res) => {
    res.sendFile(__dirname + '/public/scripts/events.js');
});

app.get("/public/scripts/logic", (req, res) => {
    res.sendFile(__dirname + '/public/scripts/logic.js');
});

function requestAPI(requestURL, res) {
    const APIKey = "1842394e60028e5dcaab6be54836575d";
    const finalRequest = requestURL + `&appid=${APIKey}`;
    console.log(finalRequest);
    fetch(finalRequest)
        .then(response => {
            if (!response.ok) {
                throw new Error("failed to get API data");
            }

            return response.json();
        })
        .then(data => {
            res.set("Content-Type", "application/json");
            res.status(200).send(data);
        })
        .catch(err => {
            res.status(404).send("Invalid city name specified or API is unavailable");
        });
}

const link = `https://api.openweathermap.org/data/2.5/weather?lang=ru&`;

app.get("/weather/city", (req, res) => {
    let str = link + encodeURI(`q=${req.query.q}&units=metric`);
    requestAPI(str, res)
});

app.get("/weather/coordinates", (req, res) => {
    let str = link + `lat=${req.query.lat}&lon=${req.query.lon}&units=metric`;
    requestAPI(str, res)
});

app.get("/favorites", (req, res) => {
    mongoClient.connect()
        .then(() => {
            let favorites = [];
            return mongoClient.db("user-info").collection("favorites").find()
                .forEach(doc => {
                    favorites.push(doc);
                }, err => {
                    res.set("Content-Type", "application/json");
                    res.status(200).send({favorites});
                });
        })
        .catch(err => {
            res.status(500).send("Internal database error");
        });
});

app.post("/favorites", (req, res) => {
    mongoClient.connect()
        .then(() => {
            mongoClient.db("user-info").collection("favorites").insertOne({name: req.body.name}, () => {
                res.status(200).send("Added a new saved: " + req.body.name);
            });
        })
        .catch(err => {
            res.status(500).send("Internal database error");
        })
});

app.delete("/favorites", (req, res) => {
    mongoClient.connect()
        .then(() => {
            mongoClient.db("user-info").collection("favorites").deleteOne({name: req.body.name}, () => {
                res.status(200).send("Deleted a saved: " + req.body.name);
            })
        })
        .catch(err => {
            res.status(500).send("Internal database error");
        });
});

app.listen(3000);