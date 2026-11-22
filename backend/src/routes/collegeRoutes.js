const express = require('express');
const router = express.Router();
const {
  getColleges,
  getCollegeById,
  createCollege,
  updateCollege,
  deleteCollege,
  toggleCollegeStatus,
} = require('../controllers/collegeController');
const { authenticate } = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

// Public routes
router.get('/', getColleges);
router.get('/:id', getCollegeById);

// Admin routes
router.post('/', authenticate, adminAuth, createCollege);
router.put('/:id', authenticate, adminAuth, updateCollege);
router.delete('/:id', authenticate, adminAuth, deleteCollege);
router.patch('/:id/toggle-status', authenticate, adminAuth, toggleCollegeStatus);

module.exports = router;
