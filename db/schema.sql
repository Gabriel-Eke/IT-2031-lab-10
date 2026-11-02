
CREATE TABLE IF NOT EXISTS movies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    year INTEGER NOT NULL CHECK (year >= 1888),
    genre TEXT NOT NULL,
    rating REAL NOT NULL CHECK (rating >= 0 AND rating <= 10),
    watched INTEGER NOT NULL DEFAULT 0 CHECK (watched IN (0, 1))
);

-- ==========================================
-- USERS TABLE - LAB 9
-- ==========================================

CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL
);
