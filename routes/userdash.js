const express = require('express');
const router = express.Router();

const db = require('../config/connection');
const collection = require('../config/collection');
const requireTeam = require('../middleware/teamAuth');
const allocation = require('../config/allocation');


// ===============================
// TEAM LOGIN PAGE
// ===============================

router.get('/dashboardlogin', (req, res) => {
    res.render('studenter', {
        student: true
    });
});


// ===============================
// TEAM LOGIN
// ===============================

router.post('/login', async (req, res) => {

    try {

        const {
            lname,
            teamName,
            teamid,
            password
        } = req.body;


        // Check fields
        if (!lname || !teamName || !teamid || !password) {

            return res.render('studenter', {
                error: 'Please fill all the fields',
                student: true
            });

        }


        // Check Team ID format
        const match = teamid.match(/^SIIH2026@(\d+)$/);

        if (!match) {

            return res.render('studenter', {
                error: 'Invalid Team ID format. Use SIIH2026@1',
                student: true
            });

        }


        const teamNumber = Number(match[1]);


        // Only 1-100
        if (teamNumber < 1 || teamNumber > 100) {

            return res.render('studenter', {
                error: 'Invalid Team ID. Only teams 1-100 are allowed.',
                student: true
            });

        }


        // Database
        const database = db.get();

        if (!database) {

            return res.status(500).render('studenter', {
                error: 'Database connection failed',
                student: true
            });

        }


        // Find team
        const team = await database
            .collection(collection.TEAM_COLLECTIONS)
            .findOne({
                teamId: teamid
            });


        if (!team) {

            return res.render('studenter', {
                error: 'Team ID not found.',
                student: true
            });

        }


        // Check password
        if (team.password !== password) {

            return res.render('studenter', {
                error: 'Team ID or password is incorrect.',
                student: true
            });

        }


        // Check if this team is already registered (has logged in before)
        const isRegistered = Boolean(
            team.leaderName && team.leaderName.trim()
        ) && Boolean(
            team.teamName && team.teamName.trim()
        );

        if (isRegistered) {
            // Existing registration must match
            if (
                team.leaderName.toLowerCase() !==
                lname.trim().toLowerCase()
            ) {

                return res.render('studenter', {
                    error: 'Leader name does not match our records.',
                    student: true
                });

            }

            if (
                team.teamName.toLowerCase() !==
                teamName.trim().toLowerCase()
            ) {

                return res.render('studenter', {
                    error: 'Team name does not match our records.',
                    student: true
                });

            }
        }

        // ===============================
        // REGISTER / UPDATE TEAM IN MONGODB
        // (first login writes profile; later logins refresh updatedAt only)
        // ===============================

        const now = new Date();

        const updateSet = {
            updatedAt: now
        };

        if (!isRegistered) {
            updateSet.leaderName = lname.trim();
            updateSet.teamName = teamName.trim();
        }

        // Ensure coordinatorNumber is always valid (self-heal old data)
        const validCoordinatorNumber =
            allocation.coordinatorNumberForTeam(teamNumber);

        if (team.coordinatorNumber !== validCoordinatorNumber) {
            updateSet.coordinatorNumber = validCoordinatorNumber;
        }

        await database
            .collection(collection.TEAM_COLLECTIONS)
            .updateOne(
                { teamId: team.teamId },
                { $set: updateSet }
            );


        // Record login activity
        await database
            .collection(collection.TEAM_LOGIN_ACTIVITY)
            .insertOne({
                teamId: team.teamId,
                teamName: isRegistered ? team.teamName : teamName.trim(),
                leaderName: isRegistered ? team.leaderName : lname.trim(),
                coordinatorNumber: validCoordinatorNumber,
                loginAt: now
            });


        // ===============================
        // CREATE SESSION
        // ===============================

        req.session.teamLoggedIn = true;

        req.session.teamid = team.teamId;

        req.session.teamNumber = teamNumber;

        req.session.leaderName = isRegistered
            ? team.leaderName
            : lname.trim();

        req.session.teamName = isRegistered
            ? team.teamName
            : teamName.trim();

        req.session.coordinatorNumber = validCoordinatorNumber;


        console.log(
            'Team login successful:',
            teamid,
            isRegistered ? '(returning)' : '(first login - registered)'
        );


        // Redirect
        return res.redirect('/teamdashboard');


    } catch (error) {

        console.error('LOGIN ERROR:', error);

        return res.status(500).render('studenter', {
            error: 'An error occurred during login',
            student: true
        });

    }

});


// ===============================
// TEAM DASHBOARD
// ===============================

router.get('/teamdashboard', requireTeam, async (req, res) => {

    try {

        const database = db.get();

        if (!database) {
            return res.status(500).send(
                'Database connection failed'
            );
        }


        const teamId = req.session.teamid;

        console.log(
            'Dashboard loading for:',
            teamId
        );


        // Find team
        const team = await database
            .collection(collection.TEAM_COLLECTIONS)
            .findOne({
                teamId: teamId,
                active: true
            });


        if (!team) {

            console.log(
                'Team not found:',
                teamId
            );

            return res.status(404).send(
                'Team not found'
            );

        }


        // Tasks — ONLY tasks addressed to this specific team
        const tasks = await database
            .collection(collection.GAVE_TASK)
            .find({
                teamId: teamId
            })
            .sort({ createdAt: -1 })
            .toArray();


        // This team's submissions (most recent first)
        const submissions = await database
            .collection(collection.SUBMIT_WORK)
            .find({ teamId: teamId })
            .sort({ submittedAt: -1 })
            .toArray();

        // Mark each task as submitted/not (backend-enforced duplicate block)
        const submittedTaskIds = new Set(
            submissions.map(s => String(s.taskId))
        );

        const tasksWithStatus = tasks.map(t => ({
            ...t,
            submitted: submittedTaskIds.has(String(t._id))
        }));

        console.log('DEBUG tasks found for', teamId, ':', tasks.length);


        // Messages
        const messages = await database
            .collection(collection.MESSAGES)
            .find({
                teamId: teamId
            })
            .sort({ createdAt: -1 })
            .toArray();


        // Project settings
        let projectSettings = {
            submissionOpen: true,
            currentDeadline: null
        };


        if (collection.PROJECT_SETTINGS) {

            const settings = await database
                .collection(collection.PROJECT_SETTINGS)
                .findOne({});


            if (settings) {
                projectSettings = settings;
            }

        }


        console.log(
            'Dashboard data loaded successfully'
        );


        return res.render('teamview', {

            team,

            tasks: tasksWithStatus || [],

            messages,

            submissions,

            success: req.query.success || null,

            error: req.query.error || null,

            projectSettings,

            student: true,

            teamSession: req.session

        });


    } catch (err) {

        console.error(
            'TEAM DASHBOARD ERROR:',
            err
        );

        return res.status(500).send(
            'Dashboard failed: ' + err.message
        );

    }

});


// ===============================
// LOGOUT
// ===============================

router.get('/logout', (req, res) => {

    req.session.destroy((err) => {

        if (err) {
            console.error('Logout failed:', err);
        }

        res.redirect('/dashboardlogin');

    });

});


// ===============================
// EXPORT
// ===============================

module.exports = router;