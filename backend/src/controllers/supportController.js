const jwt = require('jsonwebtoken');
const Complaint = require('../models/Complaint');
const User = require('../models/User');

// Helper to safely extract verified user from optional authorization header
const extractVerifiedUser = async (req) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'notes_guru_secret_fallback');
      if (decoded && decoded.userId) {
        const user = await User.findById(decoded.userId).select('name email role isActive isBlocked');
        if (user && !user.isBlocked && user.isActive) {
          return user;
        }
      }
    }
  } catch (err) {
    // In case of invalid or expired token, treat as guest submission
  }
  return null;
};

// Public/Student: Submit Help & Support Complaint
const submitComplaint = async (req, res, next) => {
  try {
    const verifiedUser = await extractVerifiedUser(req);
    const { name, email, description } = req.body;

    // Validate issue description
    if (!description || typeof description !== 'string' || !description.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please describe the issue you are experiencing.',
      });
    }

    const trimmedDescription = description.trim();
    if (trimmedDescription.length < 5) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a more detailed description of your issue (at least 5 characters).',
      });
    }

    let finalName = '';
    let finalEmail = '';
    let userId = null;
    let userType = 'guest';

    if (verifiedUser) {
      // Security: derive identity strictly from verified token/account; never trust client-submitted user ID
      userId = verifiedUser._id;
      finalName = verifiedUser.name;
      finalEmail = verifiedUser.email.toLowerCase();
      userType = 'registered';
    } else {
      // Guest user validation
      if (!name || typeof name !== 'string' || !name.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Please provide your full name.',
        });
      }

      if (!email || typeof email !== 'string' || !email.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Please provide your email address.',
        });
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const trimmedEmail = email.trim().toLowerCase();
      if (!emailRegex.test(trimmedEmail)) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a valid email address so our support team can reach you.',
        });
      }

      finalName = name.trim();
      finalEmail = trimmedEmail;
      userId = null;
      userType = 'guest';
    }

    // Generate unique readable ticket ID: GZN-XXXXXX-XXX
    const timestampPart = Date.now().toString().slice(-6);
    const randomPart = Math.floor(100 + Math.random() * 900);
    const ticketId = `GZN-${timestampPart}-${randomPart}`;

    const complaint = await Complaint.create({
      ticketId,
      userId,
      name: finalName,
      email: finalEmail,
      description: trimmedDescription,
      userType,
      status: 'new',
    });

    return res.status(201).json({
      success: true,
      message: 'Your request has been submitted successfully!',
      ticket: {
        id: complaint._id,
        ticketId: complaint.ticketId,
        name: complaint.name,
        email: complaint.email,
        userType: complaint.userType,
        status: complaint.status,
        createdAt: complaint.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Get All Complaints with Filtering, Search, and Status Counters
const getComplaints = async (req, res, next) => {
  try {
    const { search, status, userType, page = 1, limit = 50 } = req.query;

    const query = {};

    // Filter by status
    if (status && status !== 'all') {
      query.status = status;
    }

    // Filter by user type (registered vs guest)
    if (userType && userType !== 'all') {
      query.userType = userType;
    }

    // Search by name, email, or ticketId
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { ticketId: searchRegex },
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    // Fetch complaints sorted by newest first
    const [complaints, totalCount, statsData] = await Promise.all([
      Complaint.find(query)
        .populate('userId', 'name email role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Complaint.countDocuments(query),
      Complaint.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    // Format status summary counts
    const stats = {
      total: 0,
      new: 0,
      in_progress: 0,
      resolved: 0,
    };

    statsData.forEach((item) => {
      if (stats[item._id] !== undefined) {
        stats[item._id] = item.count;
      }
      stats.total += item.count;
    });

    return res.status(200).json({
      success: true,
      count: complaints.length,
      totalCount,
      currentPage: pageNum,
      totalPages: Math.ceil(totalCount / limitNum),
      stats,
      complaints,
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Get Single Complaint Details
const getComplaintById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const complaint = await Complaint.findById(id).populate('userId', 'name email role phone createdAt').lean();

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint record not found.',
      });
    }

    return res.status(200).json({
      success: true,
      complaint,
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Update Complaint Status & Notes
const updateComplaintStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    const allowedStatuses = ['new', 'in_progress', 'resolved'];
    if (status && !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be one of: new, in_progress, resolved',
      });
    }

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint record not found.',
      });
    }

    if (status) {
      complaint.status = status;
    }
    if (adminNotes !== undefined) {
      complaint.adminNotes = adminNotes.trim();
    }

    await complaint.save();

    return res.status(200).json({
      success: true,
      message: 'Complaint status updated successfully',
      complaint,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitComplaint,
  getComplaints,
  getComplaintById,
  updateComplaintStatus,
};
