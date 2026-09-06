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
    if (!database) {
      return res.status(500).render("error", { message: "Database connection failed", admin: true });
    }

    const teams = await database
      .collection(collection.TEAM_COLLECTIONS)
      .find()
      .toArray();

    const studwork = await database
      .collection(collection.SUBMIT_WORK)
      .find()
      .sort({ submittedAt: -1 })
      .toArray();

    // Enrich submissions with team name and task message
    const taskIds = studwork
      .map(s => s.taskId)
      .filter(Boolean)
      .map(id => {
        try { return new (require("mongodb").ObjectId)(String(id)); } catch { return null; }
      })
      .filter(Boolean);

    const taskMap = {};
    if (taskIds.length) {
      const tasks = await database
        .collection(collection.GAVE_TASK)
        .find({ _id: { $in: taskIds } })
        .toArray();
      tasks.forEach(t => { taskMap[String(t._id)] = t; });
    }

    const teamMap = {};
    teams.forEach(t => { teamMap[t.teamId] = t; });

    const enrichedSubmissions = (studwork || []).map(s => ({
      ...s,
      teamName: teamMap[s.teamId] ? teamMap[s.teamId].teamName : null,
      taskMessage: taskMap[String(s.taskId)] ? taskMap[String(s.taskId)].message : null
    }));

    // Sort teams by their numeric team number (SIIH2026@1, @2, ... @100)
    const teamNumber = (t) => {
      const m = (t.teamId || "").match(/^SIIH2026@(\d+)$/);
      return m ? Number(m[1]) : 9999;
    };
    teams.sort((a, b) => teamNumber(a) - teamNumber(b));

    res.render("admin", { teams: teams || [], studwork: enrichedSubmissions || [], admin: true });
  } catch (err) {
    console.error("Admin dashboard error:", err);
    res.status(500).render("error", { message: "Failed to load admin dashboard", admin: true });
  }
});
router.get("/task", requireAdmin, async (req, res, next) => {
  try {
    const database = db.get();
    const teams = await database
      .collection(collection.TEAM_COLLECTIONS)
      .find()
      .toArray();

    const teamNumber = (t) => {
      const m = (t.teamId || "").match(/^SIIH2026@(\d+)$/);
      return m ? Number(m[1]) : 9999;
    };
    teams.sort((a, b) => teamNumber(a) - teamNumber(b));

    res.render("Task", {
      teams: teams || [],
      success: req.query.success || null,
      error: req.query.error || null,
      admin: true
    });
  } catch (err) {
    console.error("Task page error:", err);
    res.status(500).send("Failed to load task form");
  }
});
router.post("/Gave-task", requireAdmin, async (req, res, next) => {
  try {
    const database = db.get();
    if (!database) {
      return res.status(500).send("Database connection failed");
    }

    const { teamId, head, message, diff, deadlineTime, shareLink } = req.body;

    if (!teamId || !message) {
      return res.status(400).render("Task", {
        error: "Team and message are required",
        admin: true
      });
    }

    const task = {
      teamId: teamId,
      head: head || "New Project Task",
      message: message,
      diff: diff || "intermediate",
      deadlineTime: deadlineTime || null,
      shareLink: shareLink || null,
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await database.collection(collection.GAVE_TASK).insertOne(task);

    console.log("Task created for", teamId, "with ID:", result.insertedId);

    res.redirect("/task?success=Task sent to " + encodeURIComponent(teamId));
  } catch (err) {
    console.error("Task creation failed:", err);
    res.status(500).send("Task creation failed");
  }
});
// router.post("/admin/approve/:id", requireAdmin, async (req, res, next) => {
//   try {
//     const database = await db.get();
//     const { ObjectId } = require("mongodb");
//     const teamid=await getNextTeamId(database);
//     const rawpassword = crypto.randomBytes(3).toString('hex');
//     const hashedPassword= await bcrypt.hash(rawpassword,10)
//     await database.collection(collection.TEAM_COLLECTIONS).updateOne(
//       { _id: new ObjectId(req.params.id) },

//       {
//         $set: {
//           status: "approved",
//           teamid:teamid,
//           password:hashedPassword,
//           displaypassword:rawpassword
//         },
//       },
//     );

//     console.log(`Team approved  TeamId:${teamid}    password:${rawpassword}`);
//     res.redirect("/approvereject");
//   } catch (err) {
//     console.log("failed", err);
//     res.status(500).send("rejected");
//   }
// });
// router.post("/admin/reject/:id", requireAdmin, async (req, res, next) => {
//   try {
//      const { ObjectId } = require("mongodb");
//     const database = await db.get();

//     await database.collection(collection.TEAM_COLLECTIONS).updateOne(
//       { _id: new ObjectId(req.params.id) },
//       {
//         $set: {
//           status: "rejected",
//         },
//       },
//     );
//     res.redirect("/approvereject");
//     console.log("rejection succed");
//   } catch (err) {
//     console.log("rejection errorr", err);
//     res.status(500).send("Rejection failed");
//   }
// });

// ==================== NEW ROUTES ====================

// Admin login activity view
router.get("/admin/login-activity", requireAdmin, async (req, res, next) => {
  try {
    const database = db.get();
    const activity = await database
      .collection(collection.TEAM_LOGIN_ACTIVITY)
      .find()
      .sort({ loginAt: -1 })
      .toArray();

    res.render("admin-login-activity", { activity, admin: true });
  } catch (err) {
    console.error("Login activity error:", err);
    res.status(500).send("Failed to load login activity");
  }
});

// Admin send message page
router.get("/admin/message", requireAdmin, async (req, res, next) => {
  try {
    const database = db.get();
    const teams = await database.collection(collection.TEAM_COLLECTIONS).find({ active: true }).toArray();

    res.render("admin-message", { teams, admin: true });
  } catch (err) {
    console.error("Message page error:", err);
    res.status(500).send("Failed to load message form");
  }
});

// Admin send message (POST)
router.post("/admin/send-message", requireAdmin, async (req, res, next) => {
  try {
    const { teamId, message } = req.body;

    if (!teamId || !message) {
      return res.status(400).send("Team ID and message are required");
    }

    const database = db.get();
    await database.collection(collection.MESSAGES).insertOne({
      teamId: teamId,
      message: message,
      sender: "admin",
      senderName: "Admin",
      createdAt: new Date(),
      read: false
    });

    res.redirect("/admin/message?success=Message sent successfully");
  } catch (err) {
    console.error("Send message error:", err);
    res.status(500).send("Failed to send message");
  }
});

// Admin project settings page
router.get("/admin/project-settings", requireAdmin, async (req, res, next) => {
  try {
    const database = db.get();
    const settings = await database.collection(collection.PROJECT_SETTINGS).findOne({}) || {
      submissionOpen: true,
      currentDeadline: null
    };

    const updated = req.query.updated || false;
    res.render("admin-project-settings", { settings, admin: true, updated });
  } catch (err) {
    console.error("Settings error:", err);
    res.status(500).send("Failed to load settings");
  }

});
// Admin update project settings
router.post("/admin/update-project-settings", requireAdmin, async (req, res, next) => {
  try {
    const { submissionOpen, currentDeadline } = req.body;
    const database = db.get();

    await database.collection(collection.PROJECT_SETTINGS).updateOne(
      {},
      {
        $set: {
          submissionOpen: submissionOpen === "true" || submissionOpen === true,
          currentDeadline: currentDeadline ? new Date(currentDeadline) : null
        }
      },
      { upsert: true }
    );

    res.redirect("/admin/project-settings?updated=true");
  } catch (err) {
    console.error("Update settings error:", err);
    res.status(500).send("Failed to update settings");
  }
});

// Admin extend task deadline
router.post("/admin/task/extend-deadline", requireAdmin, async (req, res, next) => {
  try {
    const { taskId, minutes } = req.body;
    const database = db.get();
    const { ObjectId } = require("mongodb");

    const task = await database.collection(collection.GAVE_TASK).findOne({
      _id: new ObjectId(taskId)
    });

    if (!task) {
      return res.status(404).send("Task not found");
    }

    const currentDeadline = task.deadline ? new Date(task.deadline) : new Date();
    const newDeadline = new Date(currentDeadline.getTime() + minutes * 60000);

    await database.collection(collection.GAVE_TASK).updateOne(
      { _id: new ObjectId(taskId) },
      {
        $set: {
          deadline: newDeadline,
          updatedAt: new Date()
        }
      }
    );

    res.json({ success: true, newDeadline: newDeadline });
  } catch (err) {
    console.error("Extend deadline error:", err);
    res.status(500).json({ error: "Failed to extend deadline" });
  }
});

module.exports = router;
