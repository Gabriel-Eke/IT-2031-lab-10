
/**
 * IT 2031 - Lab 10
 * Movie Validation Middleware
 *
 * Validates incoming movie data before
 * creating or updating database records.
 */

export function validateMovie(req, res, next) {
  const movie = req.body;
  const errors = {};

  // Ensure the request body is a JSON object.
  if (!movie || typeof movie !== "object" ||
      Array.isArray(movie)) {
    return res.status(400).json({
      error: "Invalid movie data.",
      fields: {
        body: "A JSON object is required."
      }
    });
  }

  // Validate title.
  if (typeof movie.title !== "string" ||
      !movie.title.trim()) {
    errors.title = "Title is required.";
  }

  // Validate year.
  const currentYear = new Date().getFullYear();

  if (!Number.isInteger(movie.year) ||
      movie.year < 1888 ||
      movie.year > currentYear + 10) {
    errors.year =
      `Year must be an integer between 1888 and ${currentYear + 10}.`;
  }

  // Validate rating.
  if (typeof movie.rating !== "number" ||
      !Number.isFinite(movie.rating) ||
      movie.rating < 0 ||
      movie.rating > 10) {
    errors.rating =
      "Rating must be a number between 0 and 10.";
  }

  // Validate genre.
  if (typeof movie.genre !== "string" ||
      !movie.genre.trim()) {
    errors.genre = "Genre is required.";
  }

  // Validate watched when provided.
  if (movie.watched !== undefined &&
      typeof movie.watched !== "boolean") {
    errors.watched = "Watched must be true or false.";
  }

  // Return field-specific validation errors.
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      error: "Movie validation failed.",
      fields: errors
    });
  }

  // Normalize validated movie data.
  req.validatedMovie = {
    title: movie.title.trim(),
    year: movie.year,
    genre: movie.genre.trim(),
    rating: movie.rating,
    watched: movie.watched ?? false
  };

  next();
}
