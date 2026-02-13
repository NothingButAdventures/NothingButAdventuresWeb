const express = require('express');
const tripTypeController = require('../controllers/tripTypeController');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', tripTypeController.getAllTripTypes);
router.get('/slug/:slug', tripTypeController.getTripTypeBySlug);
router.get('/:id', tripTypeController.getTripType);

// Admin only routes
router
    .route('/')
    .post(tripTypeController.createTripType);

router
    .route('/:id')
    .patch(tripTypeController.updateTripType)
    .delete(tripTypeController.deleteTripType);

module.exports = router;
