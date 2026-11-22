const mongoose = require('mongoose');

const semesterSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course is required'],
      index: true,
    },
    collegeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'College',
      required: true,
      index: true,
    },
    semesterNumber: {
      type: Number,
      required: [true, 'Semester number is required'],
    },
    name: {
      type: String,
      required: [true, 'Semester name is required'],
      trim: true,
    },
    // Semester package pricing
    price: {
      type: Number,
      default: 199,
      min: 0,
    },
    discountedPrice: {
      type: Number,
      default: 99,
      min: 0,
    },
    packageDescription: {
      type: String,
      default: '',
      trim: true,
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

semesterSchema.index({ courseId: 1, semesterNumber: 1 }, { unique: true });

module.exports = mongoose.model('Semester', semesterSchema);
