// Session guard for coordinator-only routes.
// Redirects unauthenticated users to the coordinator login page.
module.exports = function requireCoordinator(req, res, next) {
  if (req.session && req.session.coordinatorLoggedIn && req.session.coordinatorId) {
    return next();
  }
  return res.redirect('/coordinator/login');
};
