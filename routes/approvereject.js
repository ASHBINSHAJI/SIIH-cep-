const express = require("express");
var router = express.Router();
const path = require("path");
const db = require("../config/connection");
const collection = require("../config/collection");
const requireAdmin = require("../middleware/adminAuth");
router.get("/approvereject", requireAdmin, async (req, res, next) => {
  try {
    const database =  await db.get();
    const teams = await database
      .collection(collection.TEAM_COLLECTIONS)
      .find({status:"pending"})
      .toArray();
    console.log("approve and reject is working");
    res.render("apprej", { teams, admin: true });
  } catch (err) {
    console.log("error",err);
    res.status(500).send("SOMETHING WENT WRONG");
  }

});

router.post("/submit-task", async (req, res) => {
  try {
    console.log(req.body);
    const database =await db.get();
    await database.collection(collection.SUBMIT_WORK).insertOne({...req.body,teamid:req.session.teamid,status:"pending",submittedAt:new Date()});
    res.redirect("/teamview");
  } catch (err) {
    console.log("database", err);
    res.status(500).send("inseration failed");
  }
});
module.exports = router;
