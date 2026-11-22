const mongoose = require('mongoose');

const notePageSchema = new mongoose.Schema(
  {
    pageNumber: {
      type: Number,
      required: true,
    },
    title: {
      type: String,
      default: '',
      trim: true,
    },
    contentHtml: {
      type: String,
      required: true,
    },
    isLockedPreview: {
      type: Boolean,
      default: false,
    },
  },
  { _id: true }
);

const noteSchema = new mongoose.Schema(
  {
    unitId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Unit',
      default: null,
      index: true,
    },
    blockId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Block',
      default: null,
      index: true,
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
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
    title: {
      type: String,
      required: [true, 'Note title is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['normal', 'quick'],
      default: 'normal',
      index: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    price: {
      type: Number,
      default: 19,
      min: 0,
    },
    discountedPrice: {
      type: Number,
      default: 9,
      min: 0,
    },
    // Default 2 pages free for normal, 0 for quick notes
    previewPageCount: {
      type: Number,
      default: function () {
        return this.type === 'quick' ? 0 : 2;
      },
    },
    pages: [notePageSchema],
    pageCount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'published',
      index: true,
    },
    isPublished: {
      type: Boolean,
      default: true,
      index: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

noteSchema.pre('save', function (next) {
  if (this.pages && Array.isArray(this.pages)) {
    this.pageCount = this.pages.length;
  }
  next();
});

noteSchema.index({ unitId: 1, status: 1, isPublished: 1 });
noteSchema.index({ blockId: 1, status: 1, isPublished: 1 });
noteSchema.index({ subjectId: 1, status: 1, isPublished: 1 });
noteSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Note', noteSchema);
