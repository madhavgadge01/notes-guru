const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema(
  {
    collegeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'College',
      required: [true, 'College is required'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Course name is required'],
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
    durationYears: {
      type: Number,
      default: 3,
    },
    academicStructure: {
      type: String,
      enum: ['semester', 'year'],
      default: 'year',
      index: true,
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

courseSchema.index({ collegeId: 1, name: 1 }, { unique: true });
courseSchema.index({ name: 'text', code: 'text', description: 'text' });

module.exports = mongoose.model('Course', courseSchema);
