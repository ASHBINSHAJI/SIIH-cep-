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

    const url = `mongodb://ashbinshaji20088_db_user:${dbPassword}@ac-swqdy4r-shard-00-00.kk65zx8.mongodb.net:27017,ac-swqdy4r-shard-00-01.kk65zx8.mongodb.net:27017,ac-swqdy4r-shard-00-02.kk65zx8.mongodb.net:27017/?ssl=true&replicaSet=atlas-d1rnyv-shard-0&authSource=admin&appName=Cluster0`;

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