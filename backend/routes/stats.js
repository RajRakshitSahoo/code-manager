const express = require('express');
const { getStats } = require('../controllers/statsController');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

router.get('/', getStats);

module.exports = router;
