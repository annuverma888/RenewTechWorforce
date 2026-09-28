const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ['Solar', 'Wind', 'Other'],
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    demandLevel: {
      type: String,
      enum: ['High', 'Critical', 'Moderate'],
      default: 'High',
    },
    isCoreSkill: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Skill', skillSchema);
