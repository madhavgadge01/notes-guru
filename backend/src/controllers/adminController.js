const User = require('../models/User');
const Session = require('../models/Session');
const College = require('../models/College');
const Course = require('../models/Course');
const Semester = require('../models/Semester');
const Subject = require('../models/Subject');
const Unit = require('../models/Unit');
const Note = require('../models/Note');
const Order = require('../models/Order');
const Purchase = require('../models/Purchase');
const Payment = require('../models/Payment');
const Setting = require('../models/Setting');
const Announcement = require('../models/Announcement');
const {
  getPricingDefaults,
  updatePricingForLevel,
} = require('../services/pricingDefaultsService');

// Admin Dashboard Metrics - Optimized with parallel aggregation & lean queries
const getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalStudents,
      totalColleges,
      totalCourses,
      totalSemesters,
      totalSubjects,
      totalUnits,
      totalNotes,
      totalPurchases,
      revenueAgg,
      recentTransactions,
      recentUsers,
      popularSubjects,
      popularNotes,
    ] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      College.countDocuments(),
      Course.countDocuments(),
      Semester.countDocuments(),
      Subject.countDocuments(),
      Unit.countDocuments(),
      Note.countDocuments(),
      Purchase.countDocuments(),
      Order.aggregate([
        { $match: { status: 'paid' } },
        { $group: { _id: null, totalRevenue: { $sum: '$amount' } } },
      ]),
      Order.find()
        .sort({ createdAt: -1 })
        .limit(8)
        .populate('userId', 'name email')
        .lean(),
      User.find({ role: 'student' })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('name email createdAt isActive isBlocked')
        .lean(),
      Subject.find({ isActive: true })
        .sort({ order: 1 })
        .limit(5)
        .select('name code price discountedPrice')
        .lean(),
      Note.find({ status: 'published' })
        .sort({ order: 1 })
        .limit(5)
        .select('title type price discountedPrice pageCount')
        .lean(),
    ]);

    const totalRevenue = revenueAgg.length > 0 ? (revenueAgg[0].totalRevenue || 0) : 0;

    return res.status(200).json({
      success: true,
      stats: {
        totalStudents,
        totalColleges,
        totalCourses,
        totalSemesters,
        totalSubjects,
        totalUnits,
        totalNotes,
        totalPurchases,
        totalRevenue,
      },
      recentTransactions,
      recentUsers,
      popularSubjects,
      popularNotes,
    });
  } catch (error) {
    next(error);
  }
};

// Admin: User Management (List with active sessions)
const getUsers = async (req, res, next) => {
  try {
    const { search, role, page = 1, limit = 20 } = req.query;
    const query = {};

    if (role) {
      query.role = role;
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [users, total] = await Promise.all([
      User.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .populate('college', 'name')
        .populate('course', 'name')
        .populate('semester', 'name'),
      User.countDocuments(query),
    ]);

    // Enrich users with their active sessions and purchase counts
    const enrichedUsers = await Promise.all(
      users.map(async (u) => {
        const [activeSessions, purchasesCount] = await Promise.all([
          Session.find({ userId: u._id, isActive: true }),
          Purchase.countDocuments({ userId: u._id }),
        ]);

        return {
          ...u.toObject(),
          activeSessionsCount: activeSessions.length,
          activeSessions,
          purchasesCount,
        };
      })
    );

    return res.status(200).json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      users: enrichedUsers,
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Block/Unblock user
const toggleBlockUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ success: false, message: 'Cannot block administrator accounts' });
    }

    user.isBlocked = !user.isBlocked;
    await user.save();

    // If blocked, immediately terminate all active sessions
    if (user.isBlocked) {
      await Session.updateMany({ userId: user._id, isActive: true }, { isActive: false });
    }

    return res.status(200).json({
      success: true,
      message: `User ${user.isBlocked ? 'blocked' : 'unblocked'} successfully`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isBlocked: user.isBlocked,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Orders & Payments Management
const getOrders = async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (status) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { razorpayOrderId: { $regex: search, $options: 'i' } },
        { razorpayPaymentId: { $regex: search, $options: 'i' } },
        { itemTitle: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [orders, total] = await Promise.all([
      Order.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .populate('userId', 'name email phone'),
      Order.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      orders,
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Get Settings
const getSettings = async (req, res, next) => {
  try {
    const settings = await Setting.find();
    const settingsMap = {
      platformName: 'GenZNotes',
      tagline: 'Exam Tomorrow? GenZNotes Today.',
      defaultCurrency: 'INR',
      currencySymbol: '₹',
      defaultPreviewPagesNormal: 2,
      defaultPreviewPagesQuick: 0,
      supportEmail: 'support@genznotes.in',
      supportPhone: '+91 98765 43210',
      announcementBanner: '🚀 Semester 2026-27 updated notes are now live with exam-ready questions!',
    };

    settings.forEach((s) => {
      settingsMap[s.key] = s.value;
    });

    return res.status(200).json({
      success: true,
      settings: settingsMap,
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Update Settings
const updateSettings = async (req, res, next) => {
  try {
    const updateData = req.body;

    for (const [key, value] of Object.entries(updateData)) {
      await Setting.findOneAndUpdate(
        { key },
        { key, value },
        { upsert: true, new: true }
      );
    }

    return res.status(200).json({
      success: true,
      message: 'Platform settings updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Get remembered default pricing across hierarchy levels
const getPricingDefaultsController = async (req, res, next) => {
  try {
    const defaults = await getPricingDefaults();
    return res.status(200).json({
      success: true,
      defaults,
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Update remembered default pricing for a level or all levels
const updatePricingDefaultsController = async (req, res, next) => {
  try {
    const { level, price, discountedPrice, defaults } = req.body;

    if (level && (price !== undefined || discountedPrice !== undefined)) {
      const updated = await updatePricingForLevel(level, price, discountedPrice);
      return res.status(200).json({
        success: true,
        message: `Default pricing for ${level} updated successfully`,
        level,
        pricing: updated,
      });
    }

    if (defaults && typeof defaults === 'object') {
      for (const [lvl, val] of Object.entries(defaults)) {
        if (['semester', 'subject', 'block', 'unit'].includes(lvl) && val) {
          await updatePricingForLevel(lvl, val.price, val.discountedPrice);
        }
      }
      const updatedAll = await getPricingDefaults();
      return res.status(200).json({
        success: true,
        message: 'Default pricing saved successfully',
        defaults: updatedAll,
      });
    }

    return res.status(400).json({
      success: false,
      message: 'Please provide either level with price/discountedPrice, or a defaults object.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getUsers,
  toggleBlockUser,
  getOrders,
  getSettings,
  updateSettings,
  getPricingDefaultsController,
  updatePricingDefaultsController,
};
