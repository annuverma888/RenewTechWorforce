const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    technician: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    technicalSkill: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    safety: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    punctuality: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    qualityOfWork: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    overallRating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    feedbackComment: {
      type: String,
      required: [true, 'Please provide qualitative feedback'],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

reviewSchema.index({ project: 1, technician: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
