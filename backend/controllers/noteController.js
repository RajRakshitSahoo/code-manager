const Note = require('../models/Note');
const Activity = require('../models/Activity');

const logActivity = async (userId, action, resourceId, resourceName) => {
  try {
    await Activity.create({ user: userId, action, resource: 'note', resourceId, resourceName });
  } catch (err) {}
};

// GET /api/notes
const getNotes = async (req, res, next) => {
  try {
    const { category, favorite, search, sort = '-createdAt', page = 1, limit = 20 } = req.query;
    const query = { user: req.user._id };

    if (category) query.category = category;
    if (favorite === 'true') query.isFavorite = true;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const total = await Note.countDocuments(query);
    const notes = await Note.find(query)
      .sort(sort)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    res.json({ success: true, data: notes, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    next(error);
  }
};

// GET /api/notes/:id
const getNote = async (req, res, next) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, user: req.user._id });
    if (!note) return res.status(404).json({ error: 'Note not found' });
    res.json({ success: true, data: note });
  } catch (error) {
    next(error);
  }
};

// POST /api/notes
const createNote = async (req, res, next) => {
  try {
    const note = await Note.create({ ...req.body, user: req.user._id });
    await logActivity(req.user._id, 'note_created', note._id, note.title);
    res.status(201).json({ success: true, data: note });
  } catch (error) {
    next(error);
  }
};

// PUT /api/notes/:id
const updateNote = async (req, res, next) => {
  try {
    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!note) return res.status(404).json({ error: 'Note not found' });
    await logActivity(req.user._id, 'note_updated', note._id, note.title);
    res.json({ success: true, data: note });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/notes/:id
const deleteNote = async (req, res, next) => {
  try {
    const note = await Note.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!note) return res.status(404).json({ error: 'Note not found' });
    await logActivity(req.user._id, 'note_deleted', note._id, note.title);
    res.json({ success: true, message: 'Note deleted' });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/notes/:id/favorite
const toggleFavorite = async (req, res, next) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, user: req.user._id });
    if (!note) return res.status(404).json({ error: 'Note not found' });
    note.isFavorite = !note.isFavorite;
    await note.save();
    res.json({ success: true, data: note });
  } catch (error) {
    next(error);
  }
};

module.exports = { getNotes, getNote, createNote, updateNote, deleteNote, toggleFavorite };
