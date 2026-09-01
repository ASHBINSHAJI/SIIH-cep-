const { MongoClient } = require("mongodb");
require("dotenv").config();

const state = {
  db: null
};

module.exports.connect = function(done) {
  const url = process.env.MONGODB_URI;

  if (!url) {
    console.log("MONGODB_URI is missing");
    return done(new Error("MONGODB_URI is missing"));
  }

  console.log("Trying to connect...");

  MongoClient.connect(url)
    .then((client) => {
      console.log("mongodb connected");
      state.db = client.db("cep");
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