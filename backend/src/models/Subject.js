const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema(
  {
    semesterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Semester',
      required: [true, 'Semester is required'],
      index: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
      index: true,
    },
    collegeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'College',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Subject name is required'],
      trim: true,
    },
    code: {
      type: String,
      trim: true,
      uppercase: true,
      default: '',
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    thumbnail: {
      type: String,
      default: '',
    },
    // Subject package price
    price: {
      type: Number,
      default: 79,
      min: 0,
    },
    discountedPrice: {
      type: Number,
      default: 49,
      min: 0,
    },
    order: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

subjectSchema.index({ semesterId: 1, isActive: 1 });
subjectSchema.index({ semesterId: 1, order: 1 });
subjectSchema.index({ name: 'text', code: 'text', description: 'text' });

module.exports = mongoose.model('Subject', subjectSchema);
