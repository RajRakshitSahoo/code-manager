const express = require('express');
const { getNotes, getNote, createNote, updateNote, deleteNote, toggleFavorite } = require('../controllers/noteController');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

router.get('/', getNotes);
router.post('/', createNote);
router.get('/:id', getNote);
router.put('/:id', updateNote);
router.delete('/:id', deleteNote);
router.patch('/:id/favorite', toggleFavorite);

module.exports = router;
