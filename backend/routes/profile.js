const express = require('express');
const { getProfile, updateProfile, changePassword } = require('../controllers/statsController');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

router.get('/', getProfile);
router.put('/', updateProfile);
router.put('/password', changePassword);

module.exports = router;
