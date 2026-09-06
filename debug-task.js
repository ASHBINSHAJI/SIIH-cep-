// Debug: replicate the team dashboard task query
require("dotenv").config();
const { MongoClient } = require("mongodb");
const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/cep";
const dbName = process.env.DB_NAME || "cep";

(async () => {
  console.log("DB name:", dbName);
  const c = await MongoClient.connect(uri);
  const d = c.db(dbName);
  const tasks = await d
    .collection("admtask")
    .find({ teamId: "SIIH2026@1" })
    .toArray();
  console.log("tasks found:", tasks.length);
  tasks.forEach((t) => console.log(" -", t._id, typeof t._id, t.message));
  process.exit(0);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
