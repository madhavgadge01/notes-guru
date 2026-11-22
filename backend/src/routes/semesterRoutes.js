const express = require('express');
const router = express.Router();
const {
  getSemestersByCourse,
  getSemesterById,
  createSemester,
  updateSemester,
  deleteSemester,
  toggleSemesterStatus,
} = require('../controllers/semesterController');
const { authenticate } = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

// Public routes
router.get('/course/:courseId', getSemestersByCourse);
router.get('/:id', getSemesterById);

// Admin routes
router.post('/', authenticate, adminAuth, createSemester);
router.put('/:id', authenticate, adminAuth, updateSemester);
router.delete('/:id', authenticate, adminAuth, deleteSemester);
router.patch('/:id/toggle-status', authenticate, adminAuth, toggleSemesterStatus);

module.exports = router;
