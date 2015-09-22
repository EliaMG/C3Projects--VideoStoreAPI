"use strict";

var sqlite3 = require('sqlite3').verbose(),
  db_env = process.env.DB || 'development';

exports.moviesController = {
  index: function index(req, res, callback) {
    var db = new sqlite3.Database('./db/' + db_env + '.db');
    var statement = "SELECT * from movies;";
    var results = [];
      db.all(statement, function(err, rows) {
        rows.forEach(function (row) {
          results.push(row);
        });
        db.close();
        return res.status(200).json(results);
      });
  },

  title: function title(req,res) {
    var db = new sqlite3.Database('./db/' + db_env + '.db');
    var results = [];
    var records = req.params.records,
        offset = req.params.offset;
    var statement = "SELECT * FROM movies ORDER BY title LIMIT ? OFFSET ? ;";
      db.all(statement, [records, offset], function(err, rows) {
        rows.forEach(function (row) {
          results.push(row);
        });
        db.close();
        return res.status(200).json(results);
      });
  },

  released: function released(req,res) {
    var db = new sqlite3.Database('./db/' + db_env + '.db');
    var results = [];
    var records = req.params.records,
        offset = req.params.offset;
    var statement = "SELECT * FROM movies ORDER BY release_date DESC LIMIT ? OFFSET ? ;";
      db.all(statement, [records, offset], function(err, rows) {
        rows.forEach(function (row) {
          results.push(row);
        });
        db.close();
        return res.status(200).json(results);
      });
  },

  movie_available: function movie_available(req,res) {
    var db = new sqlite3.Database('./db/' + db_env + '.db'),
      results = [],
      title = req.params.title,
      titleish = '%' + title + '%',
      // need to account for movies that may not have rentals and movies with titleish matches
      statement = "SELECT movies.title, movies.overview, movies.inventory FROM movies, rentals WHERE movies.title LIKE ? AND movies.title=rentals.movie_title AND rentals.return_date IS NULL;",
      all_statement = "SELECT movies.title, movies.overview, movies.inventory FROM movies WHERE movies.title LIKE ?;";

      db.serialize(function() {
        db.all(statement, [titleish], function(err, rows) {
          var rented = rows.length,
              movie = rows[0];
            if (movie == undefined) {
              db.all(all_statement, [titleish], function(err, rows) {
                var movie = rows[0],
                    available = movie.inventory;
              results.push(movie, {'Available': available});
              console.log(results);
              db.close();
              return res.status(200).json(results);
              });
            } else {
              var available = movie.inventory - rented;
              results.push(movie, {'Available': available});
              db.close();
              return res.status(200).json(results);
            }
        });
      });
  }
}
