const { MongoClient } = require("mongodb");
require("dotenv").config();

const state = {
  db: null
};


const atlasUri = process.env.MONGODB_ATLAS_URI;
const localUri = process.env.MONGODB_URI;

module.exports.connect = function(done) {
  const url = process.env.MONGODB_URI || localUri;
  const dbName = process.env.DB_NAME || "cep";

  if (!url) {
    console.log("MongoDB URI is missing");
    return done(new Error("MongoDB URI is missing"));
  }

  console.log("Trying to connect to local MongoDB...");

  MongoClient.connect(url)
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