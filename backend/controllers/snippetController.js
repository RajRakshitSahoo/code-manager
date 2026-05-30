const Snippet = require('../models/Snippet');
const Activity = require('../models/Activity');

const logActivity = async (userId, action, resourceId, resourceName, metadata = {}) => {
  try {
    await Activity.create({ user: userId, action, resource: 'snippet', resourceId, resourceName, metadata });
  } catch (err) {}
};

// GET /api/snippets
const getSnippets = async (req, res, next) => {
  try {
    const { language, favorite, search, project, sort = '-createdAt', page = 1, limit = 20 } = req.query;
    const query = { user: req.user._id };

    if (language) query.language = language;
    if (favorite === 'true') query.isFavorite = true;
    if (project) query.project = project;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const total = await Snippet.countDocuments(query);
    const snippets = await Snippet.find(query)
      .populate('project', 'name color')
      .sort(sort)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .select('-versions');

    res.json({ success: true, data: snippets, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    next(error);
  }
};

// GET /api/snippets/:id
const getSnippet = async (req, res, next) => {
  try {
    const snippet = await Snippet.findOne({ _id: req.params.id, user: req.user._id }).populate('project', 'name color');
    if (!snippet) return res.status(404).json({ error: 'Snippet not found' });
    snippet.views += 1;
    await snippet.save();
    res.json({ success: true, data: snippet });
  } catch (error) {
    next(error);
  }
};

// POST /api/snippets
const createSnippet = async (req, res, next) => {
  try {
    const snippetData = { ...req.body, user: req.user._id };
    const snippet = await Snippet.create(snippetData);
    // Save initial version
    snippet.versions = [{ version: 1, code: snippet.code, summary: 'Initial version' }];
    await snippet.save();
    await logActivity(req.user._id, 'snippet_created', snippet._id, snippet.title);
    res.status(201).json({ success: true, data: snippet });
  } catch (error) {
    next(error);
  }
};

// PUT /api/snippets/:id
const updateSnippet = async (req, res, next) => {
  try {
    const existing = await Snippet.findOne({ _id: req.params.id, user: req.user._id });
    if (!existing) return res.status(404).json({ error: 'Snippet not found' });

    // Save version before update
    if (req.body.code && req.body.code !== existing.code) {
      existing.versions.push({
        version: existing.currentVersion + 1,
        code: existing.code,
        summary: req.body.versionSummary || `Version ${existing.currentVersion}`
      });
      existing.currentVersion += 1;
    }

    Object.assign(existing, req.body);
    await existing.save();
    await logActivity(req.user._id, 'snippet_updated', existing._id, existing.title);
    res.json({ success: true, data: existing });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/snippets/:id
const deleteSnippet = async (req, res, next) => {
  try {
    const snippet = await Snippet.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!snippet) return res.status(404).json({ error: 'Snippet not found' });
    await logActivity(req.user._id, 'snippet_deleted', snippet._id, snippet.title);
    res.json({ success: true, message: 'Snippet deleted' });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/snippets/:id/favorite
const toggleFavorite = async (req, res, next) => {
  try {
    const snippet = await Snippet.findOne({ _id: req.params.id, user: req.user._id });
    if (!snippet) return res.status(404).json({ error: 'Snippet not found' });
    snippet.isFavorite = !snippet.isFavorite;
    await snippet.save();
    res.json({ success: true, data: snippet });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/snippets/:id/copy
const trackCopy = async (req, res, next) => {
  try {
    const snippet = await Snippet.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { $inc: { copies: 1 } },
      { new: true }
    );
    if (!snippet) return res.status(404).json({ error: 'Snippet not found' });
    await logActivity(req.user._id, 'snippet_copied', snippet._id, snippet.title);
    res.json({ success: true, data: snippet });
  } catch (error) {
    next(error);
  }
};

// GET /api/snippets/:id/versions
const getVersions = async (req, res, next) => {
  try {
    const snippet = await Snippet.findOne({ _id: req.params.id, user: req.user._id }).select('versions currentVersion title');
    if (!snippet) return res.status(404).json({ error: 'Snippet not found' });
    res.json({ success: true, data: snippet.versions, currentVersion: snippet.currentVersion });
  } catch (error) {
    next(error);
  }
};

// POST /api/snippets/:id/restore/:version
const restoreVersion = async (req, res, next) => {
  try {
    const snippet = await Snippet.findOne({ _id: req.params.id, user: req.user._id });
    if (!snippet) return res.status(404).json({ error: 'Snippet not found' });

    const version = snippet.versions.find(v => v.version === parseInt(req.params.version));
    if (!version) return res.status(404).json({ error: 'Version not found' });

    snippet.code = version.code;
    await snippet.save();
    res.json({ success: true, data: snippet, message: `Restored to version ${req.params.version}` });
  } catch (error) {
    next(error);
  }
};

module.exports = { getSnippets, getSnippet, createSnippet, updateSnippet, deleteSnippet, toggleFavorite, trackCopy, getVersions, restoreVersion };
