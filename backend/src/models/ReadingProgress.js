const mongoose = require('mongoose');

const readingProgressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    noteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Note',
      required: true,
      index: true,
    },
    lastReadPage: {
      type: Number,
      default: 1,
    },
    totalPages: {
      type: Number,
      default: 1,
    },
    completedPages: {
      type: [Number],
      default: [1],
    },
    lastReadAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

readingProgressSchema.index({ userId: 1, noteId: 1 }, { unique: true });

module.exports = mongoose.model('ReadingProgress', readingProgressSchema);
