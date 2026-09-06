// Reset test data: clears task/submission collections and un-registers teams 1 & 2
require("dotenv").config();
const { MongoClient } = require("mongodb");
const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/cep";
const dbName = process.env.DB_NAME || "cep";

(async () => {
  const c = await MongoClient.connect(uri);
  const d = c.db(dbName);
  await d
    .collection("teams")
    .updateOne(
      { teamId: "SIIH2026@1" },
      { $set: { leaderName: "", teamName: "" } },
    );
  await d
    .collection("teams")
    .updateOne(
      { teamId: "SIIH2026@2" },
      { $unset: { leaderName: "", teamName: "" } },
    );
  await d.collection("admtask").deleteMany({});
  await d.collection("studwork").deleteMany({});
  console.log("reset OK");
  process.exit(0);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
