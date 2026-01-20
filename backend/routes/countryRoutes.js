const express = require('express');
const {
  getAllCountries,
  getCountry,
  getPopularCountries,
  getCountriesByContinent,
  searchCountries,
  getCountryStats,
  createCountry,
  updateCountry,
  deleteCountry,
} = require('../controllers/countryController');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', getAllCountries);
router.get('/popular', getPopularCountries);
router.get('/search', searchCountries);
router.get('/stats', getCountryStats);
router.get('/continent/:continent', getCountriesByContinent);
router.get('/:id', getCountry);

// Protected routes
router.use(protect);

// Admin only routes
router.use(restrictTo('admin'));
router.post('/', createCountry);
router.patch('/:id', updateCountry);
router.delete('/:id', deleteCountry);

module.exports = router;