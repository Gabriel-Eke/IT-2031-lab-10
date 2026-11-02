
import express from "express";
import passport from "../config/passport.js";

const router = express.Router();

// ==========================================
// GET /login
// ==========================================

router.get("/login", (req, res) => {
  if (req.isAuthenticated()) {
    return res.redirect("/movies");
  }

  const error = req.session.loginError || null;
  delete req.session.loginError;

  res.render("login", {
    pageTitle: "Login",
    error
  });
});

// ==========================================
// POST /login
// ==========================================

router.post("/login", (req, res, next) => {
  passport.authenticate(
    "local",
    (error, user, info) => {
      if (error) {
        return next(error);
      }

      if (!user) {
        req.session.loginError =
          info?.message || "Login failed.";

        return res.redirect("/login");
      }

      // Regenerate the session after authentication
      // to reduce session fixation risk.
      const returnTo = req.session.returnTo;

      req.session.regenerate((sessionError) => {
        if (sessionError) {
          return next(sessionError);
        }

        req.logIn(user, (loginError) => {
          if (loginError) {
            return next(loginError);
          }

          res.redirect(
            returnTo?.startsWith("/") &&
            !returnTo.startsWith("//")
              ? returnTo
              : "/movies"
          );
        });
      });
    }
  )(req, res, next);
});

// ==========================================
// POST /logout
// ==========================================

router.post("/logout", (req, res, next) => {
  req.logout((error) => {
    if (error) {
      return next(error);
    }

    req.session.destroy((sessionError) => {
      if (sessionError) {
        return next(sessionError);
      }

      res.clearCookie("connect.sid");
      res.redirect("/login");
    });
  });
});

export default router;
