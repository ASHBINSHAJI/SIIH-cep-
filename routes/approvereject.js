const express = require("express");
var router = express.Router();
const path = require("path");
const db = require("../config/connection");
const collection = require("../config/collection");
const requireAdmin = require("../middleware/adminAuth");
// router.get("/approvereject", requireAdmin, async (req, res, next) => {
//   try {
//     const database =  await db.get();
//     const teams = await database
//       .collection(collection.TEAM_COLLECTIONS)
//       .find({status:"pending"})
//       .toArray();
//     console.log("approve and reject is working");
//     res.render("apprej", { teams, admin: true });
//   } catch (err) {
//     console.log("error",err);
//     res.status(500).send("SOMETHING WENT WRONG");
//   }

// });

router.post("/submit-task", async (req, res) => {
  try {
    const database = db.get();
    if (!database) {
      return res.status(500).send('Database connection failed');
    }

    // Team must be logged in — teamId ALWAYS comes from the session
    if (!req.session || !req.session.teamid) {
      return res.status(401).render('studenter', {
        error: 'Please log in first',
        student: true
      });
    }

    const teamId = req.session.teamid;
    const { taskId, message, projectLink } = req.body;

    if (!taskId || !message || !projectLink) {
      return res.redirect('/teamdashboard?error=' +
        encodeURIComponent('Task, response message and project link are required.'));
    }

    const { ObjectId } = require('mongodb');

    let taskObjectId;
    try {
      taskObjectId = new ObjectId(taskId);
    } catch (e) {
      return res.status(400).send('Invalid task id');
    }

    // Verify the task exists AND belongs to this team (no cross-team access)
    const task = await database.collection(collection.GAVE_TASK).findOne({
      _id: taskObjectId,
      teamId: teamId
    });

    if (!task) {
      return res.redirect('/teamdashboard?error=' +
        encodeURIComponent('Task not found for your team.'));
    }

    // BLOCK DUPLICATE SUBMISSIONS (backend-enforced, not just HTML disabled)
    const existing = await database.collection(collection.SUBMIT_WORK).findOne({
      taskId: taskId,
      teamId: teamId
    });

    if (existing) {
      return res.redirect('/teamdashboard?error=' +
        encodeURIComponent('You have already submitted a response for this task.'));
    }

    // Check if project submission is open
    const projectSettings = await database.collection(collection.PROJECT_SETTINGS).findOne({});
    if (projectSettings && !projectSettings.submissionOpen) {
      return res.redirect('/teamdashboard?error=' +
        encodeURIComponent('Project submission has been closed by the admin.'));
    }

    // Record submission linked to the exact task
    const now = new Date();
    await database.collection(collection.SUBMIT_WORK).insertOne({
      taskId: taskId,
      teamId: teamId,
      teamNumber: req.session.teamNumber || null,
      message: message,
      projectLink: projectLink,
      status: 'submitted',
      submittedAt: now,
      updatedAt: now
    });

    // Mark the task as submitted
    await database.collection(collection.GAVE_TASK).updateOne(
      { _id: taskObjectId },
      { $set: { status: 'submitted', updatedAt: now } }
    );

    res.redirect('/teamdashboard?success=' +
      encodeURIComponent('Response submitted successfully'));

  } catch (err) {
    console.error('Submission error:', err);
    res.status(500).send('Submission failed');
  }
});
module.exports = router;
