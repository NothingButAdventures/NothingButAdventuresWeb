const express = require('express');
const continentController = require('../controllers/continentController');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

// Public routes (if needed)
router.get('/', continentController.getAllContinents);
router.get('/:id', continentController.getContinent);

// Protect all routes after this middleware
// router.use(protect);
// router.use(restrictTo('admin', 'lead-guide'));

// Admin only routes
router
    .route('/')
    .post(continentController.createContinent);

router
    .route('/:id')
    .patch(continentController.updateContinent)
    .delete(continentController.deleteContinent);

module.exports = router;
