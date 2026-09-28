const mongoose = require('mongoose');
const Review = require('../models/Review');
const Project = require('../models/Project');
const TechnicianProfile = require('../models/TechnicianProfile');
const Notification = require('../models/Notification');

// @desc    Submit 5-factor rating and review for a technician on project completion
// @route   POST /api/reviews
// @access  Private (EPC Company)
exports.submitReview = async (req, res) => {
  try {
    const {
      projectId,
      technicianId,
      technicalSkill,
      safety,
      punctuality,
      qualityOfWork,
      overallRating,
      feedbackComment,
    } = req.body;

    if (!projectId || !technicianId || !overallRating || !feedbackComment) {
      return res.status(400).json({
        success: false,
        message: 'Please provide projectId, technicianId, ratings, and qualitative feedback comment.',
      });
    }

    if (!mongoose.Types.ObjectId.isValid(projectId) || !mongoose.Types.ObjectId.isValid(technicianId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid project or technician ID format.',
      });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found.',
      });
    }

    // Verify company authorization
    if (req.user.role !== 'admin' && project.company.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the project contractor company can review deployed technicians.',
      });
    }

    // Check for duplicate review
    const existing = await Review.findOne({
      project: projectId,
      technician: technicianId,
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted a review for this technician on this project.',
      });
    }

    const review = await Review.create({
      project: projectId,
      company: req.user._id,
      technician: technicianId,
      technicalSkill: Number(technicalSkill) || 5,
      safety: Number(safety) || 5,
      punctuality: Number(punctuality) || 5,
      qualityOfWork: Number(qualityOfWork) || 5,
      overallRating: Number(overallRating) || 5,
      feedbackComment,
    });

    // Update technician profile: average rating, ratings count, and work history
    const allReviews = await Review.find({ technician: technicianId });
    const ratingsCount = allReviews.length;
    const avgRating = +(
      allReviews.reduce((sum, r) => sum + r.overallRating, 0) / ratingsCount
    ).toFixed(2);

    const profile = await TechnicianProfile.findOne({ user: technicianId });
    if (profile) {
      profile.averageRating = avgRating;
      profile.ratingsCount = ratingsCount;

      // Add project to previousProjects if not already recorded
      const alreadyLogged = profile.previousProjects.some(
        (p) => p.title.toLowerCase() === project.projectName.toLowerCase()
      );

      if (!alreadyLogged) {
        profile.previousProjects.push({
          title: project.projectName,
          projectType: project.projectType,
          capacity: 'Utility Site',
          role: 'Verified Renewable Technician',
          location:
            project.location && typeof project.location === 'object'
              ? `${project.location.city || ''}, ${project.location.state || ''}`
              : (project.location || 'India'),
          durationMonths: 1,
          completionYear: new Date().getFullYear(),
          description: `Contract completed with ${project.companyName}. Verified Rating: ${overallRating}/5.`,
        });
        profile.projectsCompleted += 1;
      }

      profile.calculateProfileCompletion();
      await profile.save();
    }

    // Notify technician
    await Notification.create({
      recipient: technicianId,
      title: 'New Project Review Received ⭐',
      message: `${project.companyName} rated you ${overallRating}/5 for your work on "${project.projectName}". Check your updated Skill Passport!`,
      type: 'review',
      link: `/technician/passport`,
    });

    res.status(201).json({
      success: true,
      message: 'Review and contractor rating recorded successfully. Technician Skill Passport updated.',
      data: review,
    });
  } catch (error) {
    console.error('[SubmitReview Error]:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error recording review.',
    });
  }
};

// @desc    Get reviews for a technician
// @route   GET /api/reviews/:technicianId
// @access  Public / Protected
exports.getTechnicianReviews = async (req, res) => {
  try {
    const { technicianId } = req.params;

    const reviews = await Review.find({ technician: technicianId })
      .populate('company', 'name')
      .populate('project', 'projectName projectType location')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error retrieving technician reviews.',
    });
  }
};
