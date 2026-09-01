const express = require("express");
var router = express.Router();
const crypto = require('crypto');
const bcrypt=require('bcrypt');

const db = require("../config/connection.js");
const collection = require("../config/collection");
const requireAdmin = require("../middleware/adminAuth");
async function getNextTeamId(database) {
const result =await database.collection("counters").findOneAndUpdate(
    {_id:"teamId"},
    {$inc:{seq:1}},
    {returnDocument:"after",upsert:true}
);
const doc =result.value ?? result;
const num=doc.seq
return `SIIH2026-${String(num).padStart(3,0)}`;
}

// Admin login
router.get("/adminlogin", (req, res, next) => {
  res.render("adminlogin", { admin: false, noNav: true });
});

router.post("/adminlogin", (req, res, next) => {
  const { username, password } = req.body;
  if (username === "CEPSSIIH2026" && password === "cepadmin") {
    req.session.admin = true;
    return res.redirect("/admin");
  }
  return res.status(401).render("adminlogin", {
    error: "Invalid username or password",
    admin: false,
    noNav: true,
  });
});

// Admin logout
router.get("/adminlogout", (req, res, next) => {
  req.session.destroy((err) => {
    if (err) return next(err);
    return res.redirect("/adminlogin");
  });
});
router.get('/bugrepo',(req,res)=>{
   return res.render('bugrepo',{admin:true})
})

router.get("/admin", requireAdmin, async (req, res, next) => {
  try {
    const database = db.get();
    const teams = await database
      .collection(collection.TEAM_COLLECTIONS)
      .find()
      .toArray();
    const studwork = await database
      .collection(collection.SUBMIT_WORK)
      .find()
      .toArray();
    res.render("admin", { teams, studwork, admin: true });
  } catch (err) {
    console.log("admin pass err", err);
    res.status(500).send("error Loading Team");
  }
});
router.get("/task", requireAdmin, (req, res, next) => {
  res.render("Task", { admin: true });
});
router.post("/Gave-task", requireAdmin, async (req, res, next) => {
  try {
    console.log(req.body);
    const database = db.get();
    await database.collection(collection.GAVE_TASK).insertOne(req.body);
    res.redirect("/task");
    console.log("Task Goes");
  } catch (err) {
    console.log("Task sent Failed", err);
    res.status(500).send("Task sent failed");
  }
});
router.post("/admin/approve/:id", requireAdmin, async (req, res, next) => {
  try {
    const database = await db.get();
    const { ObjectId } = require("mongodb");
    const teamid=await getNextTeamId(database);
    const rawpassword = crypto.randomBytes(3).toString('hex');
    const hashedPassword= await bcrypt.hash(rawpassword,10)
    await database.collection(collection.TEAM_COLLECTIONS).updateOne(
      { _id: new ObjectId(req.params.id) },
      
      {
        $set: {
          status: "approved",
          teamid:teamid,
          password:hashedPassword,
          displaypassword:rawpassword
        },
      },
    );

    console.log(`Team approved  TeamId:${teamid}    password:${rawpassword}`);
    res.redirect("/approvereject");
  } catch (err) {
    console.log("failed", err);
    res.status(500).send("rejected");
  }
});
router.post("/admin/reject/:id", requireAdmin, async (req, res, next) => {
  try {
     const { ObjectId } = require("mongodb");
    const database = await db.get();
   
    await database.collection(collection.TEAM_COLLECTIONS).updateOne(
      { _id: new ObjectId(req.params.id) },
      {
        $set: {
          status: "rejected",
        },
      },
    );
    res.redirect("/approvereject");
    console.log("rejection succed");
  } catch (err) {
    console.log("rejection errorr", err);
    res.status(500).send("Rejection failed");
  }
});

module.exports = router;
