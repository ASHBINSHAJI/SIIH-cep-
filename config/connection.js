const dns =require('dns')
dns.setServers(["8.8.8.8","1.1.1.1"])

const { MongoClient } = require("mongodb");
require("dotenv").config();

const state = {
  db: null
};


const mongoUri = process.env.MONGODB_URI;

module.exports.connect = function(done) {
    const dbName = process.env.DB_NAME || "cep";

    if (!mongoUri) {
        console.log("MongoDB URI is missing");
        return done(new Error("MongoDB URI is missing"));
    }

    console.log("Trying to connect to MongoDB Atlas...");

    MongoClient.connect(mongoUri)
        .then((client) => {
            console.log("mongodb connected");
            state.db = client.db(dbName);
            done();
        })
        .catch((err) => {
            console.log("mongo Connection err", err);
            done(err);
        });
};
module.exports.get = function() {
  return state.db;
};