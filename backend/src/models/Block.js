const mongoose = require('mongoose');

const blockSchema = new mongoose.Schema(
  {
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
    blockNumber: {
      type: Number,
      required: [true, 'Block number is required'],
    },
    name: {
      type: String,
      required: [true, 'Block name is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    price: {
      type: Number,
      default: 39,
      min: 0,
    },
    discountedPrice: {
      type: Number,
      default: 29,
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

blockSchema.index({ subjectId: 1, blockNumber: 1 });
blockSchema.index({ subjectId: 1, isActive: 1 });
blockSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Block', blockSchema);
