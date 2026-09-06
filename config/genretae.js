const db = require('./connection');
const collection = require('./collection');
const allocation = require('./allocation');

async function generateTeamsAndCoordinators() {
  try {
    console.log("Starting generation of teams and coordinators...");

    await new Promise((resolve, reject) => {
      db.connect((err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });

    const database = db.get();


    console.log("Generating 100 team credentials...");
    for (let i = 1; i <= 100; i++) {
      const teamId = `SIIH2026@${i}`;
      const password = `As2026@${i}`;

      await database.collection(collection.TEAM_COLLECTIONS).updateOne(
        { teamId: teamId },
        {
          $set: {
            teamId: teamId,
            password: password,
            leaderName: "",
            teamName: "",
            active: true,
            type: "team",
            coordinatorNumber: allocation.coordinatorNumberForTeam(i)
          }
        },
        { upsert: true }
      );
    }
    console.log("✓ 100 team credentials created/verified");

    // Generate 6 coordinator credentials
    console.log("Generating 6 coordinator credentials...");
    for (let i = 1; i <= allocation.TOTAL_COORDINATORS; i++) {
      const coordinatorId = `SIIH@CO-${i}`;
      const password = `SIIH-COPASS-${i}`;
      const range = allocation.teamRangeForCoordinator(i);

      await database.collection(collection.COORDINATORS).updateOne(
        { coordinatorId: coordinatorId },
        {
          $set: {
            coordinatorId: coordinatorId,
            password: password,
            coordinatorNumber: i,
            type: "coordinator",
            active: true
          }
        },
        { upsert: true }
      );
      console.log(`  SIIH@CO-${i} -> teams ${range.start}-${range.end}`);
    }
    console.log("✓ 6 coordinator credentials created/verified");

    console.log("\n=== GENERATION COMPLETED SUCCESSFULLY ===");
    console.log("\nTeams: SIIH2026@1 to SIIH2026@100");
    console.log("Passwords: As2026@1 to As2026@100");
    console.log("\nCoordinators (SIIH-COPASS-<n>):");
    for (let i = 1; i <= allocation.TOTAL_COORDINATORS; i++) {
      const range = allocation.teamRangeForCoordinator(i);
      console.log(`  Coordinator ${i}: Teams ${range.start}-${range.end}`);
    }

    process.exit(0);
  } catch (err) {
    console.error("❌ Generation failed:", err.message);
    process.exit(1);
  }
}

generateTeamsAndCoordinators();