const errorHandler = (err, req, res, next) => {
  // Safe logging that doesn't leak sensitive tokens or credentials
  console.error('[API Error]:', {
    name: err.name,
    message: err.message,
    code: err.code,
    statusCode: err.statusCode || 500,
  });

  let statusCode = err.statusCode || 500;
  let message = err.message || 'An unexpected server error occurred';

  // Handle Mongoose buffering timeout cleanly (503 instead of opaque 500)
  if (err.name === 'MongooseError' && err.message?.includes('buffering timed out')) {
    statusCode = 503;
    message = 'Database operation timed out. Please check database connectivity and configuration in Railway.';
  }

  // Handle Mongo network / server selection errors cleanly
  if (err.name === 'MongoServerSelectionError' || err.name === 'MongoNetworkError') {
    statusCode = 503;
    message = 'Unable to reach the MongoDB cluster. Please verify your MONGODB_URI and Atlas network access whitelist (0.0.0.0/0).';
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((val) => val.message)
      .join(', ');
  }

  // Mongoose duplicate key error (E11000)
  if (err.code === 11000) {
    statusCode = 400;
    const keyPattern = err.keyPattern || err.keyValue || {};
    const fields = Object.keys(keyPattern);

    if (fields.includes('courseId') && fields.includes('semesterNumber')) {
      const num = err.keyValue?.semesterNumber || '';
      message = `Semester number ${num} already exists for this course. Please choose another semester number.`;
    } else if (fields.includes('collegeId') && fields.includes('name')) {
      message = `A course with this name already exists under the selected college.`;
    } else if (fields.includes('subjectId') && fields.includes('blockNumber')) {
      const num = err.keyValue?.blockNumber || '';
      message = `Block number ${num} already exists in this subject. Please choose another block number.`;
    } else if (fields.includes('subjectId') && fields.includes('unitNumber')) {
      const num = err.keyValue?.unitNumber || '';
      message = `Unit number ${num} already exists in this subject. Please choose another unit number.`;
    } else if (fields.includes('email')) {
      message = `An account with this email address already exists.`;
    } else {
      const field = fields[0] || 'record';
      message = `A duplicate entry already exists for ${field}. Please use unique values.`;
    }
  }

  // Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid resource identifier: ${err.value}`;
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {}),
  });
};

module.exports = errorHandler;
