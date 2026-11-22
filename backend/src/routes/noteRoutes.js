const express = require('express');
const router = express.Router();
const {
  getNotesByUnit,
  getNotesByBlock,
  getNoteById,
  createNote,
  updateNote,
  deleteNote,
} = require('../controllers/noteController');
const { authenticate, optionalAuth } = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

// Public/Optional Auth routes
router.get('/unit/:unitId', optionalAuth, getNotesByUnit);
router.get('/block/:blockId', optionalAuth, getNotesByBlock);
router.get('/:id', optionalAuth, getNoteById);

// Admin routes
router.post('/', authenticate, adminAuth, createNote);
router.put('/:id', authenticate, adminAuth, updateNote);
router.delete('/:id', authenticate, adminAuth, deleteNote);

module.exports = router;
