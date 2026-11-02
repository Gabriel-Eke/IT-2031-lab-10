
import express from "express";

import {
  getAllMovies,
  getMovieById,
  showAddMovieForm,
  createMovie,
  deleteMovie,
  showEditMovieForm,
  updateMovie
} from "../controllers/moviesController.js";

import {
  requireAuth
} from "../middleware/requireAuth.js";

const router = express.Router();

// ==========================================
// PUBLIC MOVIE LIST
// ==========================================

router.get("/", getAllMovies);

// ==========================================
// CREATE MOVIE - AUTHENTICATED
// ==========================================

router.get(
  "/new",
  requireAuth,
  showAddMovieForm
);

router.post(
  "/",
  requireAuth,
  createMovie
);

// ==========================================
// EDIT MOVIE - AUTHENTICATED
// ==========================================

router.get(
  "/:id/edit",
  requireAuth,
  showEditMovieForm
);

router.post(
  "/:id/edit",
  requireAuth,
  updateMovie
);

// ==========================================
// DELETE MOVIE - AUTHENTICATED
// ==========================================

router.post(
  "/:id/delete",
  requireAuth,
  deleteMovie
);

// ==========================================
// PUBLIC MOVIE DETAILS
// ==========================================

router.get("/:id", getMovieById);

export default router;
