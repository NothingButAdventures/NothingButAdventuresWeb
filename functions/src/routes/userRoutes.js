const express = require('express');
const {
  updateMe,
  deleteMe,
  getMyBookings,
  getMyReviews,
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
  getUserStats,
} = require('../controllers/userController');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

// All routes after this middleware are protected
router.use(protect);

// User routes (authenticated users)
router.patch('/update-me', updateMe);
router.delete('/delete-me', deleteMe);
router.get('/my-bookings', getMyBookings);
router.get('/my-reviews', getMyReviews);

// Admin only routes
router.use(restrictTo('admin'));

router.get('/', getAllUsers);
router.get('/stats', getUserStats);
router.get('/:id', getUser);
router.patch('/:id', updateUser);
router.delete('/:id', deleteUser);

module.exports = router;