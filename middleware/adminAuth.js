// Session guard for admin-only routes.
// Redirects unauthenticated users to the admin login page.
module.exports = function requireAdmin(req, res, next) {
  if (req.session && req.session.admin) {
    return next();
  }
  return res.redirect('/adminlogin');
};
