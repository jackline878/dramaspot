const express = require('express');
const router = express.Router();
const movieController = require('../controllers/movie.controller');
const getInfo = require('../info').getMovieDetails;
const movies = require("../popular");

const { getMoviesGroupedByYear, getMoviesGroupedByGenre} = require('../fetchMovies');

router.get('/grouped-by-year', movieController.groupByYear, getMoviesGroupedByYear);
router.get('/grouped-by-genre', movieController.groupByGenre, getMoviesGroupedByGenre);
router.get('/category/a_z/:page', movieController.getMoviesAZ);
router.get('/category/latest/:page', movieController.getLatestMovies);
router.get('/categories/:category/:page', movieController.getCategory);
router.get('/year/:year/:page', movieController.getYear);
router.get('/', movieController.getAllMovies);
router.get('/genre/:page', movieController.getGenre);
router.get('/search/:page', movieController.search);
router.get('/trending', movieController.getTrendingMovies);
router.get('/category/popular/:page', movieController.getPopularMovies, movies);
router.get('/id/:id', movieController.getMovieById, getInfo);

module.exports = router;
