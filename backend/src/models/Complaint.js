const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema(
  {
    ticketId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email address is required'],
      trim: true,
      lowercase: true,
      match: [/\S+@\S+\.\S+/, 'Please provide a valid email address'],
    },
    description: {
      type: String,
      required: [true, 'Issue description is required'],
      trim: true,
      maxlength: [5000, 'Issue description cannot exceed 5000 characters'],
    },
    userType: {
      type: String,
      enum: ['registered', 'guest'],
      default: 'guest',
      index: true,
    },
    status: {
      type: String,
      enum: ['new', 'in_progress', 'resolved'],
      default: 'new',
      index: true,
    },
    adminNotes: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

complaintSchema.index({ name: 'text', email: 'text', ticketId: 'text' });

module.exports = mongoose.model('Complaint', complaintSchema);
