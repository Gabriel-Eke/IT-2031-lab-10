
import db from "../db/database.js";

// ==========================================
// CONVERT SQLITE DATA TO JAVASCRIPT
// ==========================================

function normalizeMovie(movie) {
  if (!movie) {
    return undefined;
  }

  return {
    ...movie,
    watched: movie.watched === 1
  };
}

// ==========================================
// GET ALL MOVIES
// ==========================================

export function getAll(sort = "id") {
  // Only these columns are allowed for sorting
  const allowedSorts = {
    id: "id",
    title: "title",
    year: "year"
  };

  const sortColumn = allowedSorts[sort] ?? "id";

  // SQL column names cannot use value placeholders.
  // sortColumn comes exclusively from our whitelist.
  const statement = db.prepare(`
    SELECT id, title, year, genre, rating, watched
    FROM movies
    ORDER BY ${sortColumn} ASC, id ASC
  `);

  const movies = statement.all();

  return movies.map(normalizeMovie);
}

// ==========================================
// GET MOVIE BY ID
// ==========================================

export function getById(id) {
  const statement = db.prepare(`
    SELECT id, title, year, genre, rating, watched
    FROM movies
    WHERE id = ?
  `);

  return normalizeMovie(statement.get(id));
}

// ==========================================
// ADD NEW MOVIE
// ==========================================

export function add(movie) {
  const statement = db.prepare(`
    INSERT INTO movies (
      title,
      year,
      genre,
      rating,
      watched
    )
    VALUES (?, ?, ?, ?, ?)
  `);

  const result = statement.run(
    movie.title,
    movie.year,
    movie.genre,
    movie.rating,
    movie.watched ? 1 : 0
  );

  return getById(result.lastInsertRowid);
}

// ==========================================
// UPDATE EXISTING MOVIE
// ==========================================

export function update(id, movie) {
  const statement = db.prepare(`
    UPDATE movies
    SET
      title = ?,
      year = ?,
      genre = ?,
      rating = ?,
      watched = ?
    WHERE id = ?
  `);

  const result = statement.run(
    movie.title,
    movie.year,
    movie.genre,
    movie.rating,
    movie.watched ? 1 : 0,
    id
  );

  if (result.changes === 0) {
    return undefined;
  }

  return getById(id);
}

// ==========================================
// DELETE MOVIE
// ==========================================

export function remove(id) {
  const statement = db.prepare(`
    DELETE FROM movies
    WHERE id = ?
  `);

  const result = statement.run(id);

  return result.changes > 0;
}
