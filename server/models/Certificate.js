const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema(
  {
    technician: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    certificateName: {
      type: String,
      required: [true, 'Please provide certificate name'],
      trim: true,
    },
    issuingOrganization: {
      type: String,
      required: [true, 'Please provide issuing organization (e.g. NSDC, Skill Council for Green Jobs, GWO)'],
      trim: true,
    },
    certificateNumber: {
      type: String,
      required: [true, 'Please provide certificate registration number'],
      trim: true,
    },
    issueDate: {
      type: Date,
      required: [true, 'Please provide issue date'],
    },
    expiryDate: {
      type: Date,
    },
    category: {
      type: String,
      enum: ['Solar', 'Wind', 'Safety', 'General Electrical'],
      default: 'Solar',
    },
    documentUrl: {
      type: String,
      default: '',
    },
    documentOriginalName: {
      type: String,
      default: 'certificate_document.pdf',
    },
    status: {
      type: String,
      enum: ['Pending', 'Verified', 'Rejected', 'Expired'],
      default: 'Pending',
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    verifiedAt: {
      type: Date,
    },
    rejectionReason: {
      type: String,
      default: '',
    },
    adminNotes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Certificate', certificateSchema);
