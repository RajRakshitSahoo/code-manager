const express = require('express');
const { getProjects, getProject, createProject, updateProject, deleteProject, toggleFavorite, archiveProject } = require('../controllers/projectController');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

router.get('/', getProjects);
router.post('/', createProject);
router.get('/:id', getProject);
router.put('/:id', updateProject);
router.delete('/:id', deleteProject);
router.patch('/:id/favorite', toggleFavorite);
router.patch('/:id/archive', archiveProject);

module.exports = router;
