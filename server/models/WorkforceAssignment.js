const mongoose = require('mongoose');

const workforceAssignmentSchema = new mongoose.Schema(
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
    roleAssigned: {
      type: String,
      required: true,
      default: 'Solar Installer',
    },
    assignmentStatus: {
      type: String,
      enum: ['Assigned', 'Active', 'Completed', 'Released'],
      default: 'Assigned',
    },
    attendance: {
      type: String,
      enum: ['Present', 'Absent', 'On Leave'],
      default: 'Present',
    },
    workStatus: {
      type: String,
      enum: ['On Schedule', 'Pending Clearance', 'Completed', 'Action Required'],
      default: 'On Schedule',
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    dailyRateAgreed: {
      type: Number,
      default: 1800,
    },
    totalDaysWorked: {
      type: Number,
      default: 0,
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

workforceAssignmentSchema.index({ project: 1, technician: 1 }, { unique: true });

module.exports = mongoose.model('WorkforceAssignment', workforceAssignmentSchema);
