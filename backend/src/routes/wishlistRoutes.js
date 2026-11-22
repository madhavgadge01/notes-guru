const express = require('express');
const router = express.Router();
const {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
} = require('../controllers/wishlistController');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, getWishlist);
router.post('/add', authenticate, addToWishlist);
router.post('/remove', authenticate, removeFromWishlist);

module.exports = router;
