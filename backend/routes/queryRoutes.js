const express = require('express');
const queryController = require('../controllers/queryController');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

// Public route to submit a query
router.post('/', queryController.createQuery);

// Protect all routes after this middleware
// router.use(protect);
// router.use(restrictTo('admin', 'lead-guide'));

// Admin only routes
router
    .route('/')
    .get(queryController.getAllQueries);

router
    .route('/:id')
    .patch(queryController.updateQueryStatus)
    .delete(queryController.deleteQuery);

module.exports = router;
