const User = require('../models/User');
const Project = require('../models/Project');
const Snippet = require('../models/Snippet');
const Note = require('../models/Note');
const Activity = require('../models/Activity');

// GET /api/stats
const getStats = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const [
      totalProjects,
      totalSnippets,
      totalNotes,
      favoriteProjects,
      favoriteSnippets,
      favoriteNotes,
      snippets,
      recentProjects,
      recentSnippets,
      recentActivities
    ] = await Promise.all([
      Project.countDocuments({ user: userId, status: { $ne: 'archived' } }),
      Snippet.countDocuments({ user: userId }),
      Note.countDocuments({ user: userId }),
      Project.countDocuments({ user: userId, isFavorite: true }),
      Snippet.countDocuments({ user: userId, isFavorite: true }),
      Note.countDocuments({ user: userId, isFavorite: true }),
      Snippet.find({ user: userId }).select('language code'),
      Project.find({ user: userId, status: { $ne: 'archived' } }).sort('-updatedAt').limit(5),
      Snippet.find({ user: userId }).sort('-updatedAt').limit(5).select('title language createdAt'),
      Activity.find({ user: userId }).sort('-createdAt').limit(20)
    ]);

    // Language stats
    const languageCounts = {};
    let totalLines = 0;
    snippets.forEach(s => {
      languageCounts[s.language] = (languageCounts[s.language] || 0) + 1;
      totalLines += (s.code.match(/\n/g) || []).length + 1;
    });

    const mostUsedLanguage = Object.entries(languageCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
    const languageStats = Object.entries(languageCounts)
      .map(([lang, count]) => ({ lang, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    // Activity by day (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const weekActivity = await Activity.aggregate([
      { $match: { user: userId, createdAt: { $gte: sevenDaysAgo } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { '_id': 1 } }
    ]);

    res.json({
      success: true,
      data: {
        totalProjects,
        totalSnippets,
        totalNotes,
        totalFavorites: favoriteProjects + favoriteSnippets + favoriteNotes,
        mostUsedLanguage,
        totalLines,
        languageStats,
        weekActivity,
        recentProjects,
        recentSnippets,
        recentActivities
      }
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/profile
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const [projects, snippets, notes] = await Promise.all([
      Project.countDocuments({ user: req.user._id }),
      Snippet.countDocuments({ user: req.user._id }),
      Note.countDocuments({ user: req.user._id })
    ]);
    res.json({ success: true, data: { ...user.toObject(), projectsCount: projects, snippetsCount: snippets, notesCount: notes } });
  } catch (error) {
    next(error);
  }
};

// PUT /api/profile
const updateProfile = async (req, res, next) => {
  try {
    const { name, bio, avatar, theme, notifications } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, bio, avatar, theme, notifications },
      { new: true, runValidators: true }
    );
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// PUT /api/profile/password
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');

    if (!(await user.comparePassword(currentPassword))) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getStats, getProfile, updateProfile, changePassword };
