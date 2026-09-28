const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    technician: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['Applied', 'Shortlisted', 'Interview', 'Interviewing', 'Selected', 'Hired', 'Rejected', 'Assigned', 'Completed'],
      default: 'Applied',
    },
    coverNote: {
      type: String,
      default: 'Interested in contributing verified renewable technical skills to this project.',
    },
    matchScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    matchBreakdown: {
      skillScore: Number,
      certScore: Number,
      expScore: Number,
      locScore: Number,
      availScore: Number,
      ratingScore: Number,
      reasons: [String],
    },
    appliedAt: {
      type: Date,
      default: Date.now,
    },
    statusHistory: [
      {
        status: String,
        updatedAt: { type: Date, default: Date.now },
        note: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Ensure a technician can only apply once to a given project
applicationSchema.index({ project: 1, technician: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);
