const Project = require('../models/Project');
const Snippet = require('../models/Snippet');
const Note = require('../models/Note');

// GET /api/search?q=query
const globalSearch = async (req, res, next) => {
  try {
    const { q, type, language, category, favorite, dateFrom, dateTo } = req.query;

    if (!q || q.trim().length < 1) {
      return res.json({ success: true, data: { projects: [], snippets: [], notes: [] } });
    }

    const searchRegex = { $regex: q, $options: 'i' };
    const userId = req.user._id;
    const dateFilter = {};
    if (dateFrom) dateFilter.$gte = new Date(dateFrom);
    if (dateTo) dateFilter.$lte = new Date(dateTo);

    const promises = [];

    if (!type || type === 'projects') {
      const projectQuery = {
        user: userId,
        $or: [{ name: searchRegex }, { description: searchRegex }, { tags: { $in: [new RegExp(q, 'i')] } }]
      };
      if (category) projectQuery.category = category;
      if (favorite === 'true') projectQuery.isFavorite = true;
      if (Object.keys(dateFilter).length) projectQuery.createdAt = dateFilter;
      promises.push(Project.find(projectQuery).limit(10));
    } else {
      promises.push(Promise.resolve([]));
    }

    if (!type || type === 'snippets') {
      const snippetQuery = {
        user: userId,
        $or: [{ title: searchRegex }, { description: searchRegex }, { code: searchRegex }, { tags: { $in: [new RegExp(q, 'i')] } }]
      };
      if (language) snippetQuery.language = language;
      if (favorite === 'true') snippetQuery.isFavorite = true;
      if (Object.keys(dateFilter).length) snippetQuery.createdAt = dateFilter;
      promises.push(Snippet.find(snippetQuery).limit(10).select('-versions -code'));
    } else {
      promises.push(Promise.resolve([]));
    }

    if (!type || type === 'notes') {
      const noteQuery = {
        user: userId,
        $or: [{ title: searchRegex }, { content: searchRegex }, { tags: { $in: [new RegExp(q, 'i')] } }]
      };
      if (category) noteQuery.category = category;
      if (favorite === 'true') noteQuery.isFavorite = true;
      if (Object.keys(dateFilter).length) noteQuery.createdAt = dateFilter;
      promises.push(Note.find(noteQuery).limit(10).select('-content'));
    } else {
      promises.push(Promise.resolve([]));
    }

    const [projects, snippets, notes] = await Promise.all(promises);

    res.json({
      success: true,
      data: { projects, snippets, notes },
      total: projects.length + snippets.length + notes.length
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { globalSearch };
