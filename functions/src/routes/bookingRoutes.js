const express = require('express');
const {
  getAllBookings,
  getBooking,
  createBooking,
  updateBooking,
  cancelBooking,
  confirmBooking,
  getBookingStats,
} = require('../controllers/bookingController');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(protect);

// User routes
router.post('/', createBooking);
router.get('/:id', getBooking);
router.patch('/:id', updateBooking);
router.patch('/:id/cancel', cancelBooking);

// Admin only routes
router.use(restrictTo('admin'));
router.get('/', getAllBookings);
router.get('/stats/overview', getBookingStats);
router.patch('/:id/confirm', confirmBooking);

module.exports = router;