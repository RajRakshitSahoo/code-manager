const Project = require('../models/Project');
const Snippet = require('../models/Snippet');
const Activity = require('../models/Activity');

const logActivity = async (userId, action, resource, resourceId, resourceName, metadata = {}) => {
  try {
    await Activity.create({ user: userId, action, resource, resourceId, resourceName, metadata });
  } catch (err) {
    console.error('Activity log error:', err.message);
  }
};

// GET /api/projects
const getProjects = async (req, res, next) => {
  try {
    const { status, category, favorite, search, sort = '-createdAt', page = 1, limit = 20 } = req.query;
    const query = { user: req.user._id };

    if (status) query.status = status;
    if (category) query.category = category;
    if (favorite === 'true') query.isFavorite = true;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const total = await Project.countDocuments(query);
    const projects = await Project.find(query)
      .sort(sort)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    res.json({ success: true, data: projects, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    next(error);
  }
};

// GET /api/projects/:id
const getProject = async (req, res, next) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, user: req.user._id });
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const snippets = await Snippet.find({ project: project._id, user: req.user._id }).select('title language createdAt');
    res.json({ success: true, data: { ...project.toObject(), snippets } });
  } catch (error) {
    next(error);
  }
};

// POST /api/projects
const createProject = async (req, res, next) => {
  try {
    const project = await Project.create({ ...req.body, user: req.user._id });
    await logActivity(req.user._id, 'project_created', 'project', project._id, project.name);
    res.status(201).json({ success: true, data: project });
  } catch (error) {
    next(error);
  }
};

// PUT /api/projects/:id
const updateProject = async (req, res, next) => {
  try {
    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!project) return res.status(404).json({ error: 'Project not found' });
    await logActivity(req.user._id, 'project_updated', 'project', project._id, project.name);
    res.json({ success: true, data: project });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/projects/:id
const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!project) return res.status(404).json({ error: 'Project not found' });
    await logActivity(req.user._id, 'project_deleted', 'project', project._id, project.name);
    res.json({ success: true, message: 'Project deleted' });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/projects/:id/favorite
const toggleFavorite = async (req, res, next) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, user: req.user._id });
    if (!project) return res.status(404).json({ error: 'Project not found' });
    project.isFavorite = !project.isFavorite;
    await project.save();
    res.json({ success: true, data: project });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/projects/:id/archive
const archiveProject = async (req, res, next) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, user: req.user._id });
    if (!project) return res.status(404).json({ error: 'Project not found' });
    project.status = project.status === 'archived' ? 'active' : 'archived';
    await project.save();
    await logActivity(req.user._id, 'project_archived', 'project', project._id, project.name);
    res.json({ success: true, data: project });
  } catch (error) {
    next(error);
  }
};

module.exports = { getProjects, getProject, createProject, updateProject, deleteProject, toggleFavorite, archiveProject };
