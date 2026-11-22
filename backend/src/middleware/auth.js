const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Session = require('../models/Session');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please log in.',
      });
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'notes_guru_secret_fallback');
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token. Please log in again.',
      });
    }

    // Find user
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User no longer exists.',
      });
    }

    if (user.isBlocked || !user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated or blocked. Please contact support.',
      });
    }

    // SINGLE DEVICE LOGIN CHECK IN MONGODB (Enforced for students; Admin allowed multi-device)
    if (decoded.sessionId && user.role !== 'admin') {
      const activeSession = await Session.findOne({
        sessionId: decoded.sessionId,
        userId: user._id,
        isActive: true,
      });

      if (!activeSession) {
        return res.status(401).json({
          success: false,
          code: 'SESSION_INVALIDATED',
          message: 'Your account was logged in on another device. Please log in again.',
        });
      }

      // Update last active time occasionally (throttled)
      activeSession.lastActiveAt = new Date();
      activeSession.save().catch(() => {});
      req.sessionDoc = activeSession;
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('[Auth Middleware Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication service error.',
    });
  }
};

const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.user = null;
      return next();
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'notes_guru_secret_fallback');
    } catch {
      req.user = null;
      return next();
    }

    const user = await User.findById(decoded.userId);
    if (user && user.isActive && !user.isBlocked) {
      if (decoded.sessionId && user.role !== 'admin') {
        const activeSession = await Session.findOne({
          sessionId: decoded.sessionId,
          userId: user._id,
          isActive: true,
        });
        if (activeSession) {
          req.user = user;
          req.sessionDoc = activeSession;
        } else {
          req.user = null;
        }
      } else {
        req.user = user;
      }
    } else {
      req.user = null;
    }

    next();
  } catch {
    req.user = null;
    next();
  }
};

module.exports = {
  authenticate,
  optionalAuth,
};
