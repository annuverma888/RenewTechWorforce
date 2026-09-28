const mongoose = require('mongoose');

const companyProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    companyName: {
      type: String,
      required: [true, 'Please provide company name'],
      trim: true,
    },
    website: {
      type: String,
      default: '',
      trim: true,
    },
    registrationNumber: {
      type: String,
      default: '', // GSTIN / Corporate ID
      trim: true,
    },
    contactPerson: {
      type: String,
      default: '',
    },
    designation: {
      type: String,
      default: 'Project Director',
    },
    officeAddress: {
      type: String,
      default: '',
    },
    city: {
      type: String,
      default: 'Noida',
    },
    state: {
      type: String,
      default: 'Uttar Pradesh',
    },
    companySize: {
      type: String,
      enum: ['10-50', '50-200', '200-500', '500+'],
      default: '50-200',
    },
    primaryDomain: {
      type: String,
      enum: ['Solar EPC', 'Wind EPC', 'Hybrid Renewable EPC', 'Solar Rooftop', 'Solar Utility Scale'],
      default: 'Solar EPC',
    },
    description: {
      type: String,
      default: 'Leading renewable energy EPC company executing utility-scale and commercial clean energy projects.',
    },
    verifiedStatus: {
      type: String,
      enum: ['Pending', 'Verified', 'Rejected'],
      default: 'Verified',
    },
    activeProjectsCount: {
      type: Number,
      default: 0,
    },
    hiredTechniciansCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('CompanyProfile', companyProfileSchema);
