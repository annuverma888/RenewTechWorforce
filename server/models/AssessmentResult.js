const mongoose = require('mongoose');

const categoryScoreSchema = new mongoose.Schema(
  {
    category: { type: String, required: true },
    score: { type: Number, required: true },
    total: { type: Number, required: true },
    percentage: { type: Number, required: true },
  },
  { _id: false }
);

const assessmentResultSchema = new mongoose.Schema(
  {
    technician: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assessment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assessment',
      required: true,
    },
    assessmentTitle: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ['Solar', 'Wind'],
      required: true,
    },
    totalQuestions: {
      type: Number,
      required: true,
    },
    correctAnswers: {
      type: Number,
      required: true,
    },
    scorePercentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    skillLevel: {
      type: String,
      enum: ['Novice', 'Competent', 'Proficient', 'Master'],
      required: true,
    },
    categoryBreakdown: [categoryScoreSchema],
    userAnswers: [
      {
        questionId: mongoose.Schema.Types.ObjectId,
        selectedOptionIndex: Number,
        correctOptionIndex: Number,
        isCorrect: Boolean,
      },
    ],
    passed: {
      type: Boolean,
      default: true,
    },
    completedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('AssessmentResult', assessmentResultSchema);
