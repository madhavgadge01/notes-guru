const express = require('express');
const router = express.Router();
const {
  getCoursesByCollege,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  toggleCourseStatus,
} = require('../controllers/courseController');
const { authenticate } = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

// Public routes
router.get('/college/:collegeId', getCoursesByCollege);
router.get('/:id', getCourseById);

// Admin routes
router.post('/', authenticate, adminAuth, createCourse);
router.put('/:id', authenticate, adminAuth, updateCourse);
router.delete('/:id', authenticate, adminAuth, deleteCourse);
router.patch('/:id/toggle-status', authenticate, adminAuth, toggleCourseStatus);

module.exports = router;
