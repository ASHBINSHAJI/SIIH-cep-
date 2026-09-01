const { MongoClient } = require('mongodb');
require('dotenv').config();

const state = {
    db: null,
    client: null
};

module.exports.connect = function (done) {
    const dbPassword = process.env.DB_PASSWORD;

    if (!dbPassword) {
        console.log("DB_PASSWORD is missing");
        return done(new Error("DB_PASSWORD is missing"));
    }

    const url = process.env.MONGODB_URI;

    console.log("Trying to connect..");

    MongoClient.connect(url)
        .then((client) => {
            console.log("mongodb connected");

            state.client = client;
            state.db = client.db("cep");

            console.log("Database Connected");

            done(null);
        })
        .catch((err) => {
            console.log("mongo Connection err");
            console.log("dberror", err);
            done(err);
        });
};

module.exports.get = function () {
    return state.db;
};