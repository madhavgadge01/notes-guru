const express = require('express');
const router = express.Router();
const {
  getUnitsBySubject,
  getUnitsByBlock,
  getUnitById,
  createUnit,
  updateUnit,
  updateSubjectUnitsPricing,
  deleteUnit,
  toggleUnitPublish,
} = require('../controllers/unitController');
const { authenticate } = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

// Public routes
router.get('/subject/:subjectId', getUnitsBySubject);
router.get('/block/:blockId', getUnitsByBlock);
router.get('/:id', getUnitById);

// Admin routes
router.post('/', authenticate, adminAuth, createUnit);
router.put('/subject/:subjectId/pricing', authenticate, adminAuth, updateSubjectUnitsPricing);
router.put('/:id', authenticate, adminAuth, updateUnit);
router.delete('/:id', authenticate, adminAuth, deleteUnit);
router.patch('/:id/toggle-publish', authenticate, adminAuth, toggleUnitPublish);
router.patch('/:id/toggle-status', authenticate, adminAuth, toggleUnitPublish);

module.exports = router;
