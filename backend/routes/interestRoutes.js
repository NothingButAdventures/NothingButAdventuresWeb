const express = require('express');
const interestController = require('../controllers/interestController');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', interestController.getAllInterests);
router.get('/slug/:slug', interestController.getInterestBySlug);
router.get('/:id', interestController.getInterest);

// Protected routes (Admin only)
router.use(protect);
router.use(restrictTo('admin'));

router
    .route('/')
    .post(interestController.createInterest);

router
    .route('/:id')
    .patch(interestController.updateInterest)
    .delete(interestController.deleteInterest);

module.exports = router;
