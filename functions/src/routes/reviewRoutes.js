const express = require('express');
const {
  getAllReviews,
  getReview,
  createReview,
  updateReview,
  deleteReview,
  getTourReviewStats,
  voteHelpful,
  reportReview,
  moderateReview,
  addReviewResponse,
  getReviewStats,
} = require('../controllers/reviewController');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', getAllReviews);
router.get('/tour/:tourId/stats', getTourReviewStats);
router.get('/:id', getReview);

// Protected routes
router.use(protect);

// User routes
router.post('/', createReview);
router.patch('/:id', updateReview);
router.delete('/:id', deleteReview);
router.patch('/:id/helpful', voteHelpful);
router.patch('/:id/report', reportReview);

// Admin only routes
router.use(restrictTo('admin'));
router.get('/stats/overview', getReviewStats);
router.patch('/:id/moderate', moderateReview);
router.patch('/:id/respond', addReviewResponse);

module.exports = router;