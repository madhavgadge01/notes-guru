const express = require('express');
const router = express.Router();
const {
  getSubjectsBySemester,
  getSubjectById,
  createSubject,
  updateSubject,
  deleteSubject,
  toggleSubjectStatus,
} = require('../controllers/subjectController');
const { authenticate, optionalAuth } = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

// Public/Optional auth routes (so logged in students get purchase status badges)
router.get('/semester/:semesterId', optionalAuth, getSubjectsBySemester);
router.get('/:id', optionalAuth, getSubjectById);

// Admin routes
router.post('/', authenticate, adminAuth, createSubject);
router.put('/:id', authenticate, adminAuth, updateSubject);
router.delete('/:id', authenticate, adminAuth, deleteSubject);
router.patch('/:id/toggle-status', authenticate, adminAuth, toggleSubjectStatus);

module.exports = router;
