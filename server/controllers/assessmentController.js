const Assessment = require('../models/Assessment');
const AssessmentResult = require('../models/AssessmentResult');
const TechnicianProfile = require('../models/TechnicianProfile');
const Notification = require('../models/Notification');

// @desc    Get all available assessments (Solar PV & Wind Technician)
// @route   GET /api/assessments
// @access  Public / Protected
exports.getAssessments = async (req, res) => {
  try {
    const { category } = req.query;
    const filter = { isActive: true };
    if (category) filter.category = category;

    // Return assessments without leaking correctOptionIndex to client before taking test
    const assessments = await Assessment.find(filter).select('-questions.correctOptionIndex -questions.explanation');

    res.status(200).json({
      success: true,
      count: assessments.length,
      data: assessments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error retrieving assessments.',
    });
  }
};

// @desc    Get assessment by ID with questions for taking the test
// @route   GET /api/assessments/:id
// @access  Private (Technician)
exports.getAssessmentById = async (req, res) => {
  try {
    const assessment = await Assessment.findById(req.params.id).select(
      '-questions.correctOptionIndex -questions.explanation'
    );

    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'Assessment module not found.',
      });
    }

    res.status(200).json({
      success: true,
      data: assessment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error retrieving assessment.',
    });
  }
};

// @desc    Submit assessment answers and calculate domain skill score
// @route   POST /api/assessments/submit
// @access  Private (Technician)
exports.submitAssessment = async (req, res) => {
  try {
    const { assessmentId, answers } = req.body;
    // answers = [{ questionId, selectedOptionIndex }]

    if (!assessmentId || !answers || !Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide assessmentId and answers array.',
      });
    }

    const assessment = await Assessment.findById(assessmentId);
    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'Assessment module not found.',
      });
    }

    let correctAnswersCount = 0;
    const evaluatedAnswers = [];
    const categoryStats = {}; // { 'PV Components': { correct: 2, total: 3 } }

    assessment.questions.forEach((q) => {
      const cat = q.topicCategory || 'General Technical';
      if (!categoryStats[cat]) {
        categoryStats[cat] = { correct: 0, total: 0 };
      }
      categoryStats[cat].total += 1;

      const userAns = answers.find(
        (a) => a.questionId && a.questionId.toString() === q._id.toString()
      );

      const isCorrect = userAns && userAns.selectedOptionIndex === q.correctOptionIndex;
      if (isCorrect) {
        correctAnswersCount += 1;
        categoryStats[cat].correct += 1;
      }

      evaluatedAnswers.push({
        questionId: q._id,
        selectedOptionIndex: userAns ? userAns.selectedOptionIndex : null,
        correctOptionIndex: q.correctOptionIndex,
        isCorrect: !!isCorrect,
        topicCategory: cat,
        explanation: q.explanation,
      });
    });

    const totalQuestions = assessment.questions.length;
    const scorePercentage = Math.round((correctAnswersCount / totalQuestions) * 100);

    // Determine skill level
    let skillLevel = 'Novice';
    if (scorePercentage >= 90) skillLevel = 'Master';
    else if (scorePercentage >= 75) skillLevel = 'Proficient';
    else if (scorePercentage >= 60) skillLevel = 'Competent';

    // Format category breakdown
    const categoryBreakdown = Object.keys(categoryStats).map((catName) => {
      const item = categoryStats[catName];
      return {
        category: catName,
        score: item.correct,
        total: item.total,
        percentage: Math.round((item.correct / item.total) * 100),
      };
    });

    const result = await AssessmentResult.create({
      technician: req.user._id,
      assessment: assessment._id,
      assessmentTitle: assessment.title,
      category: assessment.category,
      totalQuestions,
      correctAnswers: correctAnswersCount,
      scorePercentage,
      skillLevel,
      categoryBreakdown,
      userAnswers: evaluatedAnswers,
      passed: scorePercentage >= assessment.passingPercentage,
    });

    // Update technician's overall skill score in profile (average of completed assessments)
    const allResults = await AssessmentResult.find({ technician: req.user._id });
    const avgScore = Math.round(
      allResults.reduce((sum, r) => sum + r.scorePercentage, 0) / allResults.length
    );

    const profile = await TechnicianProfile.findOne({ user: req.user._id });
    if (profile) {
      profile.overallSkillScore = avgScore;
      profile.calculateProfileCompletion();
      await profile.save();
    }

    // Trigger notification
    await Notification.create({
      recipient: req.user._id,
      title: 'Assessment Evaluated!',
      message: `You scored ${scorePercentage}% in ${assessment.title} (${skillLevel} Level). Your Digital Skill Passport has been updated!`,
      type: 'certificate',
      link: '/technician/passport',
    });

    res.status(201).json({
      success: true,
      message: 'Assessment completed and scored successfully.',
      data: {
        result,
        overallSkillScore: avgScore,
        skillLevel,
        categoryBreakdown,
      },
    });
  } catch (error) {
    console.error('[SubmitAssessment Error]:', error);
    res.status(500).json({
      success: false,
      message: 'Server error evaluating assessment.',
    });
  }
};

// @desc    Get assessment results for current logged in technician
// @route   GET /api/assessments/my-results
// @access  Private (Technician)
exports.getMyAssessmentResults = async (req, res) => {
  try {
    const results = await AssessmentResult.find({ technician: req.user._id })
      .populate('assessment', 'title category durationMinutes passingPercentage')
      .sort('-completedAt');

    res.status(200).json({
      success: true,
      count: results.length,
      data: results,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error retrieving assessment results.',
    });
  }
};
