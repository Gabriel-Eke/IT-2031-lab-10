
import * as movieModel from "../models/movieModel.js";

// ==========================================
// GET /movies - Display all movies
// ==========================================

export function getAllMovies(req, res) {
  // Allow sorting by title or year only
  const allowedSorts = ["title", "year"];

  const sort = allowedSorts.includes(req.query.sort)
    ? req.query.sort
    : "id";

  // Retrieve sorted movies from SQLite
  const movies = movieModel.getAll(sort);

  // Calculate watched and unwatched counts
  const watchedCount = movies.filter(
    (movie) => movie.watched === true
  ).length;

  const unwatchedCount = movies.length - watchedCount;

  // Render the movie list using Pug
  res.render("movies/list", {
    pageTitle: "My Movies",
    movies,
    watchedCount,
    unwatchedCount,
    sort
  });
}

// ==========================================
// GET /movies/:id - Display movie details
// ==========================================

export function getMovieById(req, res) {
  const movie = movieModel.getById(req.params.id);

  if (!movie) {
    return res.status(404).render("movies/not-found", {
      pageTitle: "Movie Not Found"
    });
  }

  res.render("movies/detail", {
    pageTitle: movie.title,
    movie
  });
}

// ==========================================
// GET /movies/new - Display add movie form
// ==========================================

export function showAddMovieForm(req, res) {
  res.render("movies/new", {
    pageTitle: "Add New Movie"
  });
}

// ==========================================
// POST /movies - Create a new movie
// ==========================================

export function createMovie(req, res) {
  const { title, year, genre, rating, watched } = req.body;

  const parsedYear = Number(year);
  const parsedRating = Number(rating);

  // Validate submitted movie information
  if (
    typeof title !== "string" ||
    !title.trim() ||
    typeof genre !== "string" ||
    !genre.trim() ||
    year === undefined ||
    String(year).trim() === "" ||
    !Number.isInteger(parsedYear) ||
    parsedYear < 1888 ||
    rating === undefined ||
    String(rating).trim() === "" ||
    !Number.isFinite(parsedRating) ||
    parsedRating < 0 ||
    parsedRating > 10
  ) {
    return res.status(400).send(
      "Invalid movie information."
    );
  }

  // Insert movie through the SQLite model
  const newMovie = movieModel.add({
    title: title.trim(),
    year: parsedYear,
    genre: genre.trim(),
    rating: parsedRating,
    watched: watched === "on"
  });

  // Redirect to newly created movie
  res.redirect(`/movies/${newMovie.id}`);
}

// ==========================================
// GET /movies/:id/edit - Display edit form
// ==========================================

export function showEditMovieForm(req, res) {
  // Retrieve movie from SQLite
  const movie = movieModel.getById(req.params.id);

  if (!movie) {
    return res.status(404).render("movies/not-found", {
      pageTitle: "Movie Not Found"
    });
  }

  // Render edit form with existing movie data
  res.render("movies/edit", {
    pageTitle: `Edit ${movie.title}`,
    movie
  });
}

// ==========================================
// POST /movies/:id/edit - Update movie
// ==========================================

export function updateMovie(req, res) {
  const { title, year, genre, rating, watched } = req.body;

  const parsedYear = Number(year);
  const parsedRating = Number(rating);

  // Validate submitted movie information
  if (
    typeof title !== "string" ||
    !title.trim() ||
    typeof genre !== "string" ||
    !genre.trim() ||
    year === undefined ||
    String(year).trim() === "" ||
    !Number.isInteger(parsedYear) ||
    parsedYear < 1888 ||
    rating === undefined ||
    String(rating).trim() === "" ||
    !Number.isFinite(parsedRating) ||
    parsedRating < 0 ||
    parsedRating > 10
  ) {
    return res.status(400).send(
      "Invalid movie information."
    );
  }

  // Update movie through SQLite model
  const updatedMovie = movieModel.update(
    req.params.id,
    {
      title: title.trim(),
      year: parsedYear,
      genre: genre.trim(),
      rating: parsedRating,
      watched: watched === "on"
    }
  );

  if (!updatedMovie) {
    return res.status(404).render("movies/not-found", {
      pageTitle: "Movie Not Found"
    });
  }

  // Redirect to updated movie details
  res.redirect(`/movies/${updatedMovie.id}`);
}

// ==========================================
// POST /movies/:id/delete - Delete movie
// ==========================================

export function deleteMovie(req, res) {
  // Delete movie through SQLite model
  movieModel.remove(req.params.id);

  // Redirect to movie list
  res.redirect("/movies");
}
