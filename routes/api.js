
/**
 * IT 2031 - Lab 10
 * REST API with JWT Authentication
 *
 * File: routes/api.js
 * Base URL: /api/v1
 *
 * Public Endpoints:
 * GET    /movies
 * GET    /movies/:id
 * POST   /login
 *
 * Protected Endpoints:
 * POST   /movies
 * PUT    /movies/:id
 * DELETE /movies/:id
 */

import express from "express";
import jwt from "jsonwebtoken";

import {
  findByUsername,
  verifyPassword
} from "../models/userModel.js";

import {
  getAll,
  getById,
  add,
  update,
  remove
} from "../models/movieModel.js";

import {
  authenticateJWT
} from "../middleware/authenticateJWT.js";

import {
  validateMovie
} from "../middleware/validateMovie.js";

const router = express.Router();

// ==========================================
// VALIDATE MOVIE ID
// ==========================================

function parseMovieId(req, res, next) {
  const rawId = req.params.id;

  if (
    typeof rawId !== "string" ||
    !/^[1-9]\d*$/.test(rawId)
  ) {
    return res.status(400).json({
      error: "Movie ID must be a positive integer."
    });
  }

  const id = Number(rawId);

  if (!Number.isSafeInteger(id)) {
    return res.status(400).json({
      error: "Invalid movie ID."
    });
  }

  req.movieId = id;

  next();
}

// ==========================================
// GET ALL MOVIES
// GET /api/v1/movies
// ==========================================

router.get("/movies", (req, res) => {
  const allowedSorts = ["id", "title", "year"];

  const sort =
    typeof req.query.sort === "string"
      ? req.query.sort
      : "id";

  if (!allowedSorts.includes(sort)) {
    return res.status(400).json({
      error: "Sort must be id, title, or year."
    });
  }

  const movies = getAll(sort);

  return res.status(200).json(movies);
});

// ==========================================
// GET SINGLE MOVIE
// GET /api/v1/movies/:id
// ==========================================

router.get(
  "/movies/:id",
  parseMovieId,
  (req, res) => {
    const movie = getById(req.movieId);

    if (!movie) {
      return res.status(404).json({
        error: "Movie not found."
      });
    }

    return res.status(200).json(movie);
  }
);

// ==========================================
// LOGIN AND GENERATE JWT
// POST /api/v1/login
// ==========================================

router.post("/login", (req, res) => {
  const body = req.body;

  if (
    !body ||
    typeof body !== "object" ||
    Array.isArray(body)
  ) {
    return res.status(400).json({
      error: "A JSON object is required."
    });
  }

  const { username, password } = body;

  if (
    typeof username !== "string" ||
    typeof password !== "string" ||
    !username.trim() ||
    !password
  ) {
    return res.status(400).json({
      error: "Username and password are required."
    });
  }

  const user = findByUsername(username.trim());

  if (
    !user ||
    !verifyPassword(password, user.password_hash)
  ) {
    return res.status(401).json({
      error: "Invalid username or password."
    });
  }

  const token = jwt.sign(
    {
      userId: user.id
    },
    process.env.JWT_SECRET,
    {
      algorithm: "HS256",
      expiresIn: "1h"
    }
  );

  return res.status(200).json({
    token,
    tokenType: "Bearer",
    expiresIn: 3600
  });
});

// ==========================================
// CREATE MOVIE - JWT REQUIRED
// POST /api/v1/movies
// ==========================================

router.post(
  "/movies",
  authenticateJWT,
  validateMovie,
  (req, res) => {
    const movie = add(req.validatedMovie);

    return res.status(201).json(movie);
  }
);

// ==========================================
// UPDATE MOVIE - JWT REQUIRED
// PUT /api/v1/movies/:id
// ==========================================

router.put(
  "/movies/:id",
  authenticateJWT,
  parseMovieId,
  validateMovie,
  (req, res) => {
    const movie = update(
      req.movieId,
      req.validatedMovie
    );

    if (!movie) {
      return res.status(404).json({
        error: "Movie not found."
      });
    }

    return res.status(200).json(movie);
  }
);

// ==========================================
// DELETE MOVIE - JWT REQUIRED
// DELETE /api/v1/movies/:id
// ==========================================

router.delete(
  "/movies/:id",
  authenticateJWT,
  parseMovieId,
  (req, res) => {
    const deleted = remove(req.movieId);

    if (!deleted) {
      return res.status(404).json({
        error: "Movie not found."
      });
    }

    return res.status(204).send();
  }
);

export default router;
