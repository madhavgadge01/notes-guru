require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');

// Import routes
const authRoutes = require('./routes/authRoutes');
const collegeRoutes = require('./routes/collegeRoutes');
const courseRoutes = require('./routes/courseRoutes');
const semesterRoutes = require('./routes/semesterRoutes');
const subjectRoutes = require('./routes/subjectRoutes');
const blockRoutes = require('./routes/blockRoutes');
const unitRoutes = require('./routes/unitRoutes');
const noteRoutes = require('./routes/noteRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const libraryRoutes = require('./routes/libraryRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
const searchRoutes = require('./routes/searchRoutes');
const adminRoutes = require('./routes/adminRoutes');
const supportRoutes = require('./routes/supportRoutes');
const seoRoutes = require('./routes/seoRoutes');

const app = express();

// Security Middleware: Configure COOP and CORP to allow Google OAuth popup & cross-origin resources
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
  })
);

// CORS configuration supporting dynamic subdomains, custom frontend URLs, and local dev
const cleanUrl = (url) => (url ? url.trim().replace(/\/+$/, '') : null);

const customOrigins = [
  cleanUrl(process.env.FRONTEND_URL),
  cleanUrl(process.env.ADMIN_URL),
].filter(Boolean);

const defaultOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  'https://notes-guru-eight.vercel.app',
];

const allowedOrigins = [...new Set([...customOrigins, ...defaultOrigins])];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      const normalizedOrigin = origin.replace(/\/+$/, '');
      if (
        allowedOrigins.includes(origin) ||
        allowedOrigins.includes(normalizedOrigin) ||
        origin.endsWith('.vercel.app') ||
        process.env.NODE_ENV !== 'production'
      ) {
        return callback(null, true);
      }
      return callback(null, true); // Fallback allow to prevent unneeded blockage
    },
    credentials: true,
  })
);

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Body parsers with rawBody verification for Cashfree Webhook signatures
app.use(
  express.json({
    limit: '10mb',
    verify: (req, res, buf) => {
      req.rawBody = buf;
    },
  })
);
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Apply rate limiter to general API
app.use('/api', apiLimiter);

// Health check endpoint with diagnostic database status
app.get('/api/health', (req, res) => {
  const stateMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };
  const dbState = mongoose.connection.readyState;
  const isDbConnected = dbState === 1;

  const healthData = {
    status: isDbConnected ? 'online' : 'degraded',
    timestamp: new Date().toISOString(),
    service: 'GenZNotes Backend API',
    version: '1.0.0',
    database: {
      status: stateMap[dbState] || 'unknown',
      connected: isDbConnected,
    },
    environment: process.env.NODE_ENV || 'development',
  };

  const httpStatus = isDbConnected ? 200 : 503;
  return res.status(httpStatus).json(healthData);
});

// Database readiness guard for all API endpoints (fail-fast instead of 10s buffering timeout)
app.use('/api', (req, res, next) => {
  if (req.path === '/health') return next();

  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      message:
        'Database connection is currently unavailable. Please verify MONGODB_URI in your Railway deployment variables and MongoDB Atlas network access.',
      code: 'DB_UNAVAILABLE',
    });
  }
  next();
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/colleges', collegeRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/semesters', semesterRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/blocks', blockRoutes);
app.use('/api/units', unitRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/library', libraryRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/seo', seoRoutes);

// Catch-all 404
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl}`,
  });
});

// Centralized Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Start Server if run directly
if (require.main === module) {
  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`[GenZNotes API] Running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
    });
  });
}

module.exports = app;
