const Wishlist = require('../models/Wishlist');
const Subject = require('../models/Subject');
const Unit = require('../models/Unit');
const Note = require('../models/Note');

// Get Wishlist items
const getWishlist = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const items = await Wishlist.find({ userId }).sort({ addedAt: -1 });

    const subjectIds = items.filter((i) => i.itemType === 'subject').map((i) => i.itemId);
    const unitIds = items.filter((i) => i.itemType === 'unit').map((i) => i.itemId);
    const noteIds = items.filter((i) => i.itemType === 'note').map((i) => i.itemId);

    const [subjects, units, notes] = await Promise.all([
      Subject.find({ _id: { $in: subjectIds } }).populate('semesterId courseId collegeId'),
      Unit.find({ _id: { $in: unitIds } }).populate('subjectId semesterId'),
      Note.find({ _id: { $in: noteIds } }).select('-pages.contentHtml').populate('unitId subjectId'),
    ]);

    return res.status(200).json({
      success: true,
      wishlist: {
        subjects,
        units,
        notes,
        total: items.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Add to wishlist
const addToWishlist = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { itemType, itemId } = req.body;

    if (!itemType || !itemId) {
      return res.status(400).json({
        success: false,
        message: 'Item type (subject, unit, note) and item ID are required',
      });
    }

    const item = await Wishlist.findOneAndUpdate(
      { userId, itemType, itemId },
      { userId, itemType, itemId, addedAt: new Date() },
      { upsert: true, new: true }
    );

    return res.status(200).json({
      success: true,
      message: 'Item added to wishlist',
      item,
    });
  } catch (error) {
    next(error);
  }
};

// Remove from wishlist
const removeFromWishlist = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { itemType, itemId } = req.body;

    await Wishlist.deleteOne({ userId, itemType, itemId });

    return res.status(200).json({
      success: true,
      message: 'Item removed from wishlist',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
};
