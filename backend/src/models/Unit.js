const mongoose = require('mongoose');

const unitSchema = new mongoose.Schema(
  {
    blockId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Block',
      index: true,
      default: null,
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: [true, 'Subject is required'],
      index: true,
    },
    semesterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Semester',
      required: true,
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
    unitNumber: {
      type: Number,
      required: [true, 'Unit number is required'],
    },
    title: {
      type: String,
      required: [true, 'Unit title is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    price: {
      type: Number,
      default: 29,
      min: 0,
    },
    discountedPrice: {
      type: Number,
      default: 19,
      min: 0,
    },
    order: {
      type: Number,
      default: 0,
    },
    isPublished: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

unitSchema.index({ subjectId: 1, unitNumber: 1 });
unitSchema.index({ subjectId: 1, isPublished: 1 });
unitSchema.index({ blockId: 1, unitNumber: 1 });
unitSchema.index({ blockId: 1, isPublished: 1 });

module.exports = mongoose.model('Unit', unitSchema);
