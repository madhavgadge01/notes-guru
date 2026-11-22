const express = require('express');
const router = express.Router();
const {
  getMyLibrary,
  getContinueReading,
  updateReadingProgress,
} = require('../controllers/libraryController');
const { authenticate } = require('../middleware/auth');

router.get('/my-library', authenticate, getMyLibrary);
router.get('/continue-reading', authenticate, getContinueReading);
router.post('/progress', authenticate, updateReadingProgress);

module.exports = router;
