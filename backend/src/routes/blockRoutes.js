const express = require('express');
const router = express.Router();
const {
  getBlocksBySubject,
  getBlockById,
  createBlock,
  updateBlock,
  deleteBlock,
  toggleBlockStatus,
} = require('../controllers/blockController');
const { authenticate, optionalAuth } = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

// Public/Optional auth routes
router.get('/subject/:subjectId', optionalAuth, getBlocksBySubject);
router.get('/:id', optionalAuth, getBlockById);

// Admin routes
router.post('/', authenticate, adminAuth, createBlock);
router.put('/:id', authenticate, adminAuth, updateBlock);
router.delete('/:id', authenticate, adminAuth, deleteBlock);
router.patch('/:id/toggle-status', authenticate, adminAuth, toggleBlockStatus);

module.exports = router;
