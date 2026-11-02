
import crypto from "node:crypto";
import db from "../db/database.js";

// ==========================================
// FIND USER BY USERNAME
// ==========================================

export function findByUsername(username) {
  return db.prepare(`
    SELECT id, username, password_hash
    FROM users
    WHERE username = ?
  `).get(username);
}

// ==========================================
// FIND USER BY ID
// ==========================================

export function findById(id) {
  return db.prepare(`
    SELECT id, username
    FROM users
    WHERE id = ?
  `).get(id);
}

// ==========================================
// VERIFY PASSWORD
// ==========================================

export function verifyPassword(password, storedHash) {
  try {
    const [salt, originalHash] = storedHash.split(":");

    if (!salt || !originalHash) {
      return false;
    }

    const originalBuffer = Buffer.from(
      originalHash,
      "hex"
    );

    if (originalBuffer.length !== 64) {
      return false;
    }

    const candidateHash = crypto.scryptSync(
      password,
      salt,
      originalBuffer.length
    );

    return crypto.timingSafeEqual(
      originalBuffer,
      candidateHash
    );
  } catch {
    return false;
  }
}
