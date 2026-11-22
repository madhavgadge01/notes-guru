const express = require('express');
const router = express.Router();
const {
  submitComplaint,
  getComplaints,
  getComplaintById,
  updateComplaintStatus,
} = require('../controllers/supportController');
const { authenticate } = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const { supportLimiter } = require('../middleware/rateLimiter');

// Public/Student Complaint Submission with dedicated rate limiting
router.post('/complaints', supportLimiter, submitComplaint);

// Admin Complaint Management endpoints
router.get('/admin/complaints', authenticate, adminAuth, getComplaints);
router.get('/admin/complaints/:id', authenticate, adminAuth, getComplaintById);
router.patch('/admin/complaints/:id/status', authenticate, adminAuth, updateComplaintStatus);

module.exports = router;
