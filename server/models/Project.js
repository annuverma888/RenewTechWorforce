const mongoose = require('mongoose');

const workerRoleSchema = new mongoose.Schema(
  {
    role: { type: String, required: true },
    count: { type: Number, required: true, default: 1 },
    filledCount: { type: Number, default: 0 },
  },
  { _id: false }
);

const projectSchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    companyName: {
      type: String,
      required: true,
    },
    projectName: {
      type: String,
      required: [true, 'Please provide a project name'],
      trim: true,
    },
    projectType: {
      type: String,
      enum: ['Solar', 'Wind'],
      required: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide project description'],
    },
    location: {
      city: { type: String, required: true },
      state: { type: String, required: true },
      address: { type: String, default: '' },
      siteName: { type: String, default: '' },
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    durationDays: {
      type: Number,
      default: 30,
    },
    numberWorkers: {
      type: Number,
      required: [true, 'Please provide total required workers count'],
      default: 5,
    },
    hiredWorkersCount: {
      type: Number,
      default: 0,
    },
    workerRoles: [workerRoleSchema],
    requiredSkills: {
      type: [String],
      required: true,
      default: ['PV Installation', 'Electrical Safety'],
    },
    minimumExperience: {
      type: Number,
      default: 2,
    },
    requiredCertifications: {
      type: [String],
      default: ['Solar PV Installer'],
    },
    budget: {
      type: Number,
      required: true,
      default: 250000,
    },
    workType: {
      type: String,
      enum: ['Full-time Contract', 'Daily Basis', 'Turnkey Milestone'],
      default: 'Full-time Contract',
    },
    projectStatus: {
      type: String,
      enum: ['Open', 'In Progress', 'Completed', 'Cancelled'],
      default: 'Open',
    },
    progressPercentage: {
      type: Number,
      enum: [0, 25, 50, 75, 100],
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Project', projectSchema);
