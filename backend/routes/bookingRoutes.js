const express = require('express');
const {
  getAllBookings,
  getBooking,
  createBooking,
  updateBooking,
  cancelBooking,
  confirmBooking,
  getBookingStats,
  capturePayPalPayment,
  getCancellationPreview,
  trackCheckoutStart,
  submitTravelerDocuments,
  toggleDocumentVerification,
} = require('../controllers/bookingController');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(protect);

// User routes
router.post('/', createBooking);
router.post('/track-checkout', trackCheckoutStart);
router.get('/:id', getBooking);
router.patch('/:id', updateBooking);
router.get('/:id/cancellation-preview', getCancellationPreview);
router.post('/:id/capture-paypal', capturePayPalPayment);
router.patch('/:id/cancel', cancelBooking);
router.patch('/:id/submit-documents', submitTravelerDocuments);

// Admin only routes
router.use(restrictTo('admin'));
router.get('/', getAllBookings);
router.get('/stats/overview', getBookingStats);
router.patch('/:id/confirm', confirmBooking);
router.patch('/:id/toggle-doc-verification', toggleDocumentVerification);

module.exports = router;