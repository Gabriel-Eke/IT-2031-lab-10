
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import Database from "better-sqlite3";

// ==========================================
// RESOLVE DATABASE FILE PATHS
// ==========================================

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const databasePath = path.join(__dirname, "movies.db");
const schemaPath = path.join(__dirname, "schema.sql");

// ==========================================
// CONNECT TO SQLITE DATABASE
// ==========================================

const db = new Database(databasePath);

// ==========================================
// PASSWORD HASHING
// ==========================================

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");

  const hash = crypto
    .scryptSync(password, salt, 64)
    .toString("hex");

  return `${salt}:${hash}`;
}

try {
  // ========================================
  // CREATE DATABASE TABLES
  // ========================================

  const schema = fs.readFileSync(schemaPath, "utf8");
  db.exec(schema);

  // ========================================
  // INITIAL MOVIE DATA
  // ========================================

  const movies = [
    ["The Shawshank Redemption", 1994, "Drama", 9.3, 1],
    ["The Dark Knight", 2008, "Action", 9.0, 1],
    ["Inception", 2010, "Sci-Fi", 8.8, 1],
    ["Interstellar", 2014, "Sci-Fi", 8.7, 0],
    ["Gladiator", 2000, "Action", 8.5, 1],
    ["The Lion King", 1994, "Animation", 8.5, 1],
    ["Black Panther", 2018, "Action", 7.3, 0],
    ["The Matrix", 1999, "Sci-Fi", 8.7, 1]
  ];

  // ========================================
  // PARAMETERIZED INSERT STATEMENT
  // ========================================

  const insertMovie = db.prepare(`
    INSERT INTO movies (
      title,
      year,
      genre,
      rating,
      watched
    )
    VALUES (?, ?, ?, ?, ?)
  `);

  // ========================================
  // SEED MOVIES
  // ========================================

  const seedMovies = db.transaction(() => {
    db.prepare("DELETE FROM movies").run();

    for (const movie of movies) {
      insertMovie.run(...movie);
    }
  });

  seedMovies();

  console.log(
    `Database seeded successfully with ${movies.length} movies.`
  );

  // ========================================
  // CREATE DEMO USER
  // ========================================

  const username = "demo";
  const password = "DemoPassword123!";

  const existingUser = db.prepare(`
    SELECT id
    FROM users
    WHERE username = ?
  `).get(username);

  if (!existingUser) {
    const passwordHash = hashPassword(password);

    db.prepare(`
      INSERT INTO users (
        username,
        password_hash
      )
      VALUES (?, ?)
    `).run(username, passwordHash);

    console.log("Demo user created successfully.");
  } else {
    console.log("Demo user already exists.");
  }

} finally {
  // ========================================
  // CLOSE DATABASE CONNECTION
  // ========================================

  db.close();
}
