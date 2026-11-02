
import Database from "better-sqlite3";
import path from "node:path";
import { fileURLToPath } from "node:url";

// ==========================================
// RESOLVE DATABASE DIRECTORY
// ==========================================

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ==========================================
// SQLITE DATABASE CONNECTION
// ==========================================

// Store the database file inside the db folder
const databasePath = path.join(__dirname, "movies.db");

// Open the database or create it if missing
const db = new Database(databasePath);

// Enable foreign key support
db.pragma("foreign_keys = ON");

// ==========================================
// EXPORT DATABASE CONNECTION
// ==========================================

export default db;
