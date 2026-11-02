
import "dotenv/config";

import express from "express";
import morgan from "morgan";
import session from "express-session";
import path from "node:path";
import { fileURLToPath } from "node:url";

import passport from "./config/passport.js";
import authRouter from "./routes/auth.js";
import moviesRouter from "./routes/movies.js";

// ==========================================
// RESOLVE PROJECT DIRECTORY
// ==========================================

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

if (!process.env.SESSION_SECRET ||
    process.env.SESSION_SECRET.length < 32) {
  throw new Error(
    "SESSION_SECRET must contain at least 32 characters."
  );
}

// ==========================================
// VIEW ENGINE CONFIGURATION
// ==========================================

app.set("view engine", "pug");

app.set(
  "views",
  path.join(__dirname, "views")
);

// ==========================================
// APPLICATION MIDDLEWARE
// ==========================================

app.use(morgan("dev"));

app.use(express.urlencoded({
  extended: true
}));

app.use(express.json());

app.use(
  express.static(
    path.join(__dirname, "public")
  )
);

// ==========================================
// EXPRESS SESSION
// ==========================================

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 2
    }
  })
);

// ==========================================
// PASSPORT AUTHENTICATION
// ==========================================

app.use(passport.initialize());
app.use(passport.session());

// ==========================================
// SHARE AUTHENTICATION WITH PUG
// ==========================================

app.use((req, res, next) => {
  res.locals.currentUser = req.user || null;
  res.locals.isAuthenticated =
    req.isAuthenticated();

  next();
});

// ==========================================
// APPLICATION ROUTES
// ==========================================

app.get("/", (req, res) => {
  res.redirect("/movies");
});

app.use("/", authRouter);

app.use("/movies", moviesRouter);

// ==========================================
// 404 ERROR HANDLER
// ==========================================

app.use((req, res) => {
  res.status(404).render("movies/not-found", {
    pageTitle: "Page Not Found"
  });
});

// ==========================================
// APPLICATION ERROR HANDLER
// ==========================================

app.use((error, req, res, next) => {
  console.error(error);

  res.status(500).send(
    "An unexpected server error occurred."
  );
});

// ==========================================
// START EXPRESS SERVER
// ==========================================

app.listen(PORT, () => {
  console.log(
    `Server running at http://localhost:${PORT}`
  );
});
