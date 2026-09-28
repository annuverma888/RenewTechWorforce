const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema(
  {
    questionText: {
      type: String,
      required: true,
    },
    topicCategory: {
      type: String,
      required: true, // e.g., 'PV Components', 'Electrical Safety', 'Wiring & Connections', 'Inverter Installation', 'Maintenance'
    },
    options: [
      {
        type: String,
        required: true,
      },
    ],
    correctOptionIndex: {
      type: Number,
      required: true,
    },
    explanation: {
      type: String,
      default: '',
    },
    difficulty: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      default: 'Intermediate',
    },
  },
  { _id: true }
);

const assessmentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true, // e.g. "Solar PV Technical Competency Assessment" or "Wind Turbine Technician Assessment"
    },
    category: {
      type: String,
      enum: ['Solar', 'Wind'],
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    durationMinutes: {
      type: Number,
      default: 20,
    },
    totalQuestions: {
      type: Number,
      default: 10,
    },
    passingPercentage: {
      type: Number,
      default: 70,
    },
    topics: {
      type: [String],
      default: [],
    },
    questions: [questionSchema],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Assessment', assessmentSchema);
