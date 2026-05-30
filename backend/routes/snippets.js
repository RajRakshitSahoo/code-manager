const express = require('express');
const { getSnippets, getSnippet, createSnippet, updateSnippet, deleteSnippet, toggleFavorite, trackCopy, getVersions, restoreVersion } = require('../controllers/snippetController');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

router.get('/', getSnippets);
router.post('/', createSnippet);
router.get('/:id', getSnippet);
router.put('/:id', updateSnippet);
router.delete('/:id', deleteSnippet);
router.patch('/:id/favorite', toggleFavorite);
router.patch('/:id/copy', trackCopy);
router.get('/:id/versions', getVersions);
router.post('/:id/restore/:version', restoreVersion);

module.exports = router;
