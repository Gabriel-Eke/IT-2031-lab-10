
export function requireAuth(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }

  // Remember where the user wanted to go.
  if (req.method === "GET") {
    req.session.returnTo = req.originalUrl;
  }

  // Redirect unauthenticated users.
  return res.redirect("/login");
}
