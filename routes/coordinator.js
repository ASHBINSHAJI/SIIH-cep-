const express = require('express');
const router = express.Router();
const db = require('../config/connection');
const collection = require('../config/collection');
const requireCoordinator = require('../middleware/coordinatorAuth');
const allocation = require('../config/allocation');

// Coordinator team ranges now come from the shared allocation module
// (config/allocation.js): 6 coordinators, teams 1-100 in blocks of 17.

// Function to get team range for coordinator
function getCoordinatorTeamRange(coordinatorNumber) {
  return allocation.teamRangeForCoordinator(coordinatorNumber);
}

// Coordinator login page (GET)
router.get('/coordinator/login', (req, res, next) => {
  res.render('coordinator-login', { coordinator: true });
});

// Coordinator login (POST)
router.post('/coordinator/login', async (req, res, next) => {
  try {
    const database = db.get();
    if (!database) {
      return res.status(500).render('coordinator-login', {
        error: 'Database connection failed',
        coordinator: true
      });
    }

    const { coordinatorId, password } = req.body;

    // Validate input
    if (!coordinatorId || !password) {
      return res.render('coordinator-login', {
        error: 'Please enter Coordinator ID and password',
        coordinator: true
      });
    }

    // Validate credentials against MongoDB (source of truth)
    const coordinator = await database
      .collection(collection.COORDINATORS)
      .findOne({ coordinatorId: coordinatorId, active: true });

    if (!coordinator) {
      return res.render('coordinator-login', {
        error: 'Invalid Coordinator ID',
        coordinator: true
      });
    }

    if (coordinator.password !== password) {
      return res.render('coordinator-login', {
        error: 'Incorrect password',
        coordinator: true
      });
    }

    // Create session
    req.session.coordinatorLoggedIn = true;
    req.session.coordinatorId = coordinator.coordinatorId;
    req.session.coordinatorNumber = coordinator.coordinatorNumber;

    console.log("Coordinator login successful:", coordinatorId);

    return res.redirect('/coordinator/dashboard');

  } catch (error) {
    console.error("Coordinator login error:", error);
    return res.status(500).render('coordinator-login', {
      error: 'An error occurred during login',
      coordinator: true
    });
  }
});

// Coordinator dashboard (GET - protected)
router.get('/coordinator/dashboard', requireCoordinator, async (req, res, next) => {
  try {
    const database = db.get();
    if (!database) {
      return res.status(500).send('Database connection failed');
    }

    const coordinatorNumber = req.session.coordinatorNumber;
    const coordinatorId = req.session.coordinatorId;
    const teamRange = getCoordinatorTeamRange(coordinatorNumber);

    let teams = [];

    // Get assigned teams for this coordinator (allocation from DB field)
    if (teamRange.start && teamRange.end) {
      teams = await database
        .collection(collection.TEAM_COLLECTIONS)
        .find({ coordinatorNumber: coordinatorNumber, active: true })
        .toArray();
    }

    // Attach submission status per team from the submissions collection
    const teamIds = teams.map(t => t.teamId);
    const submissions = teamIds.length
      ? await database
          .collection(collection.SUBMIT_WORK)
          .find({ teamId: { $in: teamIds } })
          .toArray()
      : [];

    const submittedMap = {};
    submissions.forEach(s => {
      // keep the most recent submission per team
      if (
        !submittedMap[s.teamId] ||
        new Date(s.submittedAt) > new Date(submittedMap[s.teamId].submittedAt)
      ) {
        submittedMap[s.teamId] = s;
      }
    });

    const teamsWithStatus = teams.map(t => ({
      ...t,
      submissionStatus: submittedMap[t.teamId] ? 'Submitted' : 'Pending',
      submission: submittedMap[t.teamId] || null
    }));

    res.render('coordinator-dashboard', {
      coordinator: true,
      coordinatorId: coordinatorId,
      coordinatorNumber: coordinatorNumber,
      teams: teamsWithStatus || [],
      teamCount: (teamsWithStatus || []).length,
      teamsRange:
        teamRange.start && teamRange.end
          ? `Teams ${teamRange.start}-${teamRange.end}`
          : 'No teams assigned'
    });

  } catch (error) {
    console.error("Coordinator dashboard error:", error);
    res.status(500).send('Dashboard failed');
  }
});

// Coordinator login activity view (filtered by assigned teams)
router.get('/coordinator/login-activity', requireCoordinator, async (req, res, next) => {
  try {
    const database = db.get();
    const coordinatorNumber = req.session.coordinatorNumber;
    const teamRange = getCoordinatorTeamRange(coordinatorNumber);

    let activity = [];
    if (teamRange.start && teamRange.end) {
      activity = await database
        .collection(collection.TEAM_LOGIN_ACTIVITY)
        .find({ coordinatorNumber: coordinatorNumber })
        .sort({ loginAt: -1 })
        .toArray();
    }

    res.render('coordinator-login-activity', {
      activity,
      coordinator: true,
      coordinatorId: req.session.coordinatorId,
      coordinatorNumber: coordinatorNumber
    });
  } catch (error) {
    console.error("Coordinator login activity error:", error);
    res.status(500).send('Failed to load activity');
  }
});

// Coordinator send message page
router.get('/coordinator/message', requireCoordinator, async (req, res, next) => {
  try {
    const database = db.get();
    const coordinatorNumber = req.session.coordinatorNumber;
    const teamRange = getCoordinatorTeamRange(coordinatorNumber);

    let teams = [];
    if (teamRange.start && teamRange.end) {
      teams = await database
        .collection(collection.TEAM_COLLECTIONS)
        .find({ coordinatorNumber: coordinatorNumber, active: true })
        .toArray();
    }

    res.render('coordinator-message', { teams, coordinator: true });
  } catch (error) {
    console.error("Coordinator message page error:", error);
    res.status(500).send('Failed to load message form');
  }
});

// Coordinator send message (POST)
router.post('/coordinator/send-message', requireCoordinator, async (req, res, next) => {
  try {
    const { teamId, message } = req.body;
    const database = db.get();
    const coordinatorNumber = req.session.coordinatorNumber;
    const teamRange = getCoordinatorTeamRange(coordinatorNumber);

    // Verify team belongs to this coordinator
    if (teamRange.start && teamRange.end) {
      const match = teamId.match(/^SIIH2026@(\d+)$/);
      if (!match) {
        return res.status(403).send("Invalid team ID");
      }

      const teamNumber = Number(match[1]);
      if (teamNumber < teamRange.start || teamNumber > teamRange.end) {
        return res.status(403).send("This team is not assigned to your coordinator panel");
      }
    } else {
      return res.status(403).send("You have no teams assigned");
    }

    if (!teamId || !message) {
      return res.status(400).send("Team ID and message are required");
    }

    await database.collection(collection.MESSAGES).insertOne({
      teamId: teamId,
      message: message,
      sender: "coordinator",
      senderName: `Coordinator ${coordinatorNumber}`,
      createdAt: new Date(),
      read: false
    });

    res.redirect('/coordinator/message?success=Message sent successfully');
  } catch (error) {
    console.error("Coordinator send message error:", error);
    res.status(500).send('Failed to send message');
  }
});

// Coordinator logout
router.get('/coordinator/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Coordinator logout failed:', err);
    }
    res.redirect('/coordinator/login');
  });
});

module.exports = router;
