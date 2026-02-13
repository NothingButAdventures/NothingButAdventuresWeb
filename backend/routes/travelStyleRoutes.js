const express = require('express');
const travelStyleController = require('../controllers/travelStyleController');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', travelStyleController.getAllTravelStyles);
router.get('/slug/:slug', travelStyleController.getTravelStyleBySlug);
router.get('/:id', travelStyleController.getTravelStyle);

// Admin only routes
router
    .route('/')
    .post(travelStyleController.createTravelStyle);

router
    .route('/:id')
    .patch(travelStyleController.updateTravelStyle)
    .delete(travelStyleController.deleteTravelStyle);

module.exports = router;
