const express = require('express');
const physicalRatingController = require('../controllers/physicalRatingController');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', physicalRatingController.getAllPhysicalRatings);
router.get('/slug/:slug', physicalRatingController.getPhysicalRatingBySlug);
router.get('/:id', physicalRatingController.getPhysicalRating);

// Admin only routes
router
    .route('/')
    .post(physicalRatingController.createPhysicalRating);

router
    .route('/:id')
    .patch(physicalRatingController.updatePhysicalRating)
    .delete(physicalRatingController.deletePhysicalRating);

module.exports = router;
