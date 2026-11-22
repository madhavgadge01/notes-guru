const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getUsers,
  toggleBlockUser,
  getOrders,
  getSettings,
  updateSettings,
  getPricingDefaultsController,
  updatePricingDefaultsController,
} = require('../controllers/adminController');
const {
  getComplaints,
  getComplaintById,
  updateComplaintStatus,
} = require('../controllers/supportController');
const { authenticate } = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

// All routes here require authentication + admin role
router.use(authenticate, adminAuth);

router.get('/dashboard', getDashboardStats);
router.get('/users', getUsers);
router.patch('/users/:id/toggle-block', toggleBlockUser);
router.get('/orders', getOrders);
router.get('/settings', getSettings);
router.put('/settings', updateSettings);
router.get('/pricing-defaults', getPricingDefaultsController);
router.put('/pricing-defaults', updatePricingDefaultsController);

// Support Complaints Management
router.get('/complaints', getComplaints);
router.get('/complaints/:id', getComplaintById);
router.patch('/complaints/:id/status', updateComplaintStatus);

module.exports = router;
