const adminAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required. Please log in.',
    });
  }

  // Strictly enforce that only the designated admin email can access administrative endpoints
  if (req.user.role !== 'admin' || req.user.email?.toLowerCase() !== 'rozar@notesguru.in') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Only authorized administrator rozar@notesguru.in is permitted.',
    });
  }

  next();
};

module.exports = adminAuth;
