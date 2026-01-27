const express = require('express');
const {
  getAllTours,
  getTour,
  getToursByCountry,
  getFeaturedTours,
  getPopularTours,
  searchTours,
  checkTourAvailability,
  getTourStats,
  createTour,
  updateTour,
  deleteTour,
} = require('../controllers/tourController');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', getAllTours);
router.get('/featured', getFeaturedTours);
router.get('/popular', getPopularTours);
router.get('/search', searchTours);
router.get('/stats', getTourStats);
router.get('/country/:countryId', getToursByCountry);
router.get('/:id', getTour);
router.get('/:tourId/availability/:date', checkTourAvailability);

// Protected routes
router.use(protect);

// Admin only routes
router.use(restrictTo('admin'));
router.post('/', createTour);
router.patch('/:id', updateTour);
router.delete('/:id', deleteTour);

module.exports = router;