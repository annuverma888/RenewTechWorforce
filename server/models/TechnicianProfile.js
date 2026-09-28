const mongoose = require('mongoose');

const skillItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ['Solar', 'Wind', 'Other'],
      default: 'Solar',
    },
    proficiency: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
      default: 'Intermediate',
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false }
);

const previousProjectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    projectType: { type: String, enum: ['Solar', 'Wind', 'Hybrid'], default: 'Solar' },
    capacity: { type: String, default: '' }, // e.g. "500kW", "2MW", "50MW"
    role: { type: String, default: '' },
    location: { type: String, default: '' },
    durationMonths: { type: Number, default: 1 },
    completionYear: { type: Number },
    description: { type: String, default: '' },
  },
  { _id: false }
);

const technicianProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    profession: {
      type: String,
      required: [true, 'Please specify your primary renewable profession'],
      default: 'Certified Solar PV Wireman',
    },
    yearsOfExperience: {
      type: Number,
      required: [true, 'Please specify years of experience'],
      default: 0,
      min: 0,
    },
    currentAvailability: {
      type: String,
      enum: ['Available', 'On Project', 'Unavailable'],
      default: 'Available',
    },
    expectedDailyRate: {
      type: Number,
      default: 1500, // INR per day
    },
    expectedMonthlyRate: {
      type: Number,
      default: 35000,
    },
    city: {
      type: String,
      default: 'Kanpur',
      trim: true,
    },
    state: {
      type: String,
      default: 'Uttar Pradesh',
      trim: true,
    },
    preferredWorkLocations: {
      type: [String],
      default: ['Uttar Pradesh', 'Rajasthan', 'Gujarat'],
    },
    renewableSkills: {
      type: [skillItemSchema],
      default: [],
    },
    previousProjects: {
      type: [previousProjectSchema],
      default: [],
    },
    overallSkillScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    verifiedCertificatesCount: {
      type: Number,
      default: 0,
    },
    projectsCompleted: {
      type: Number,
      default: 0,
    },
    averageRating: {
      type: Number,
      default: 5.0,
      min: 0,
      max: 5,
    },
    ratingsCount: {
      type: Number,
      default: 0,
    },
    profileCompletion: {
      type: Number,
      default: 30, // Percentage
    },
    bio: {
      type: String,
      default: 'Certified renewable energy technician specializing in clean energy installations and O&M.',
    },
  },
  {
    timestamps: true,
  }
);

// Method to recalculate profile completion
technicianProfileSchema.methods.calculateProfileCompletion = function () {
  let score = 20; // Base account creation
  if (this.profession) score += 10;
  if (this.yearsOfExperience > 0) score += 10;
  if (this.city && this.state) score += 10;
  if (this.renewableSkills && this.renewableSkills.length >= 3) score += 20;
  if (this.previousProjects && this.previousProjects.length >= 1) score += 10;
  if (this.verifiedCertificatesCount > 0) score += 10;
  if (this.overallSkillScore > 0) score += 10;
  this.profileCompletion = Math.min(score, 100);
  return this.profileCompletion;
};

module.exports = mongoose.model('TechnicianProfile', technicianProfileSchema);
