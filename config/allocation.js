// Single source of truth for coordinator -> team allocation.
// 6 coordinators, deterministic:
//   Coordinator 1 -> teams 1-17
//   Coordinator 2 -> teams 18-34
//   Coordinator 3 -> teams 35-51
//   Coordinator 4 -> teams 52-68
//   Coordinator 5 -> teams 69-84
//   Coordinator 6 -> teams 85-100
// Math.ceil(i/17) capped at 6 produces exactly these ranges.

const TOTAL_TEAMS = 100;
const TOTAL_COORDINATORS = 6;
const TEAMS_PER_COORDINATOR = 17; // ceil(100/6)

function coordinatorNumberForTeam(teamNumber) {
  if (
    !Number.isInteger(teamNumber) ||
    teamNumber < 1 ||
    teamNumber > TOTAL_TEAMS
  ) {
    return null;
  }
  // Exact spec ranges: 1-17, 18-34, 35-51, 52-68, 69-84, 85-100
  if (teamNumber <= 68) return Math.ceil(teamNumber / TEAMS_PER_COORDINATOR);
  if (teamNumber <= 84) return 5;
  return 6;
}

function teamRangeForCoordinator(coordinatorNumber) {
  if (
    !Number.isInteger(coordinatorNumber) ||
    coordinatorNumber < 1 ||
    coordinatorNumber > TOTAL_COORDINATORS
  ) {
    return { start: null, end: null };
  }
  // Exact spec ranges
  const ranges = {
    1: { start: 1, end: 17 },
    2: { start: 18, end: 34 },
    3: { start: 35, end: 51 },
    4: { start: 52, end: 68 },
    5: { start: 69, end: 84 },
    6: { start: 85, end: 100 },
  };
  return ranges[coordinatorNumber] || { start: null, end: null };
}

function teamIdsForCoordinator(coordinatorNumber) {
  const { start, end } = teamRangeForCoordinator(coordinatorNumber);
  const ids = [];
  if (start === null) return ids;
  for (let i = start; i <= end; i++) ids.push(`SIIH2026@${i}`);
  return ids;
}

module.exports = {
  TOTAL_TEAMS,
  TOTAL_COORDINATORS,
  TEAMS_PER_COORDINATOR,
  coordinatorNumberForTeam,
  teamRangeForCoordinator,
  teamIdsForCoordinator,
};
