const express = require('express');
const Activity = require('../models/Activity');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

router.get('/', async (req, res, next) => {
  try {
    const { page = 1, limit = 30 } = req.query;
    const activities = await Activity.find({ user: req.user._id })
      .sort('-createdAt')
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));
    const total = await Activity.countDocuments({ user: req.user._id });
    res.json({ success: true, data: activities, total });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
