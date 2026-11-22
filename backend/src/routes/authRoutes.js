const express = require('express');
const router = express.Router();
const {
  register,
  login,
  googleAuth,
  logout,
  getMe,
  updateAcademicPreferences,
  updateProfile,
  changePassword,
} = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');

router.post('/google', authLimiter, googleAuth);
router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, getMe);
router.put('/preferences', authenticate, updateAcademicPreferences);
router.put('/profile', authenticate, updateProfile);
router.put('/change-password', authenticate, changePassword);

module.exports = router;
