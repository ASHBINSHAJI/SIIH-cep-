module.exports = function requireTeam(req, res, next) {
  if (req.session && req.session.teamid) {
    return next();
  }
  return res.redirect('/dashboardlogin');
};
