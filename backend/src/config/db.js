const mongoose = require('mongoose');

// Helper to safely mask MongoDB URI credentials for logging
const maskMongoUri = (uri) => {
  if (!uri) return 'undefined';
  try {
    return uri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@');
  } catch {
    return '***masked***';
  }
};

// Retrieve and sanitize MongoDB connection string from multiple common environment variables
const getMongoUri = () => {
  const rawUri =
    process.env.MONGODB_URI ||
    process.env.MONGO_URL ||
    process.env.MONGODB_URL ||
    process.env.DATABASE_URL;

  if (!rawUri) return null;
  return rawUri.trim().replace(/^['"]|['"]$/g, '');
};

let reconnectTimer = null;

const scheduleReconnect = () => {
  if (reconnectTimer) return;
  console.log('[Database] Scheduling background reconnection check in 5 seconds...');
  reconnectTimer = setTimeout(async () => {
    reconnectTimer = null;
    if (mongoose.connection.readyState === 1) return;

    const uri = getMongoUri();
    if (!uri) {
      console.warn('[Database] Cannot reconnect: No MongoDB connection URI available.');
      return;
    }

    try {
      console.log(`[Database] Attempting reconnection to: ${maskMongoUri(uri)}`);
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 10000,
      });
      console.log('[Database] MongoDB reconnection successful!');
    } catch (err) {
      console.error(`[Database Reconnect Error] ${err.message}`);
      scheduleReconnect();
    }
  }, 5000);
};

const ensureSuperAdmin = async () => {
  try {
    const User = require('../models/User');
    let admin = await User.findOne({ email: 'rozar@notesguru.in' }).select('+password');
    if (!admin) {
      await User.create({
        name: 'GenZNotes Administrator',
        email: 'rozar@notesguru.in',
        password: '73min@42373',
        role: 'admin',
        isActive: true,
      });
      console.log('[Database] Auto-provisioned super admin: rozar@notesguru.in');
    } else {
      let needsSave = false;
      if (admin.role !== 'admin') {
        admin.role = 'admin';
        needsSave = true;
      }
      if (!admin.isActive) {
        admin.isActive = true;
        needsSave = true;
      }
      if (admin.isBlocked) {
        admin.isBlocked = false;
        needsSave = true;
      }
      const isMatch = await admin.comparePassword('73min@42373');
      if (!isMatch) {
        admin.password = '73min@42373';
        needsSave = true;
      }
      if (needsSave) {
        await admin.save();
        console.log('[Database] Super admin account synced: rozar@notesguru.in');
      }
    }
  } catch (err) {
    console.warn('[Database] Super admin check deferred:', err.message);
  }
};

const connectDB = async () => {
  const uri = getMongoUri();

  if (!uri) {
    console.error(
      '[Database Error] No MongoDB connection string provided!\n' +
      'Please configure MONGODB_URI (or MONGO_URL / MONGODB_URL) in your Railway variables or .env file.\n' +
      'If using MongoDB Atlas, ensure Network Access whitelist allows 0.0.0.0/0.'
    );
    return null;
  }

  // Setup connection event listeners once
  if (!mongoose.connection._hasNotesGuruListeners) {
    mongoose.connection._hasNotesGuruListeners = true;

    mongoose.connection.on('connected', () => {
      console.log('[Database] MongoDB connection established successfully.');
    });

    mongoose.connection.on('error', (err) => {
      console.error(`[Database Error] Connection runtime error: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('[Database Warning] MongoDB disconnected. Will attempt reconnection.');
      scheduleReconnect();
    });
  }

  try {
    console.log(`[Database] Connecting to MongoDB: ${maskMongoUri(uri)}`);
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
    });
    console.log(`[Database] MongoDB Connected: host=${conn.connection.host}, database=${conn.connection.name}`);
    await ensureSuperAdmin();
    return conn;
  } catch (error) {
    console.error(`[Database Error] Connection attempt failed: ${error.message}`);
    // Start background reconnection so server stays alive and recovers automatically
    scheduleReconnect();
    return null;
  }
};

module.exports = connectDB;
