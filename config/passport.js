
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";

import {
  findByUsername,
  findById,
  verifyPassword
} from "../models/userModel.js";

// ==========================================
// PASSPORT LOCAL STRATEGY
// ==========================================

passport.use(
  new LocalStrategy(
    {
      usernameField: "username",
      passwordField: "password"
    },
    (username, password, done) => {
      try {
        const user = findByUsername(username);

        if (!user) {
          return done(null, false, {
            message: "Invalid username or password."
          });
        }

        const validPassword = verifyPassword(
          password,
          user.password_hash
        );

        if (!validPassword) {
          return done(null, false, {
            message: "Invalid username or password."
          });
        }

        return done(null, {
          id: user.id,
          username: user.username
        });
      } catch (error) {
        return done(error);
      }
    }
  )
);

// ==========================================
// SERIALIZE USER
// ==========================================

passport.serializeUser((user, done) => {
  done(null, user.id);
});

// ==========================================
// DESERIALIZE USER
// ==========================================

passport.deserializeUser((id, done) => {
  try {
    const user = findById(id);

    done(null, user || false);
  } catch (error) {
    done(error);
  }
});

export default passport;
