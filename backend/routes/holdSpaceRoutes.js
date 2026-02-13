const express = require('express');
const {
    createHoldSpace,
    getMyHoldSpaces,
    releaseHoldSpace,
    getHoldSpace,
} = require('../controllers/holdSpaceController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(protect);

router.post('/', createHoldSpace);
router.get('/my-holds', getMyHoldSpaces);
router.get('/:id', getHoldSpace);
router.patch('/:id/release', releaseHoldSpace);

module.exports = router;
