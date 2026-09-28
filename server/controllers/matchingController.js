const mongoose = require('mongoose');
const Project = require('../models/Project');
const User = require('../models/User');
const TechnicianProfile = require('../models/TechnicianProfile');
const Certificate = require('../models/Certificate');
const Application = require('../models/Application');
const AssessmentResult = require('../models/AssessmentResult');
const { calculateMatchScore } = require('../services/matchingEngine');

// @desc    Match technicians for a specific project (EPC view)
// @route   GET /api/matching/project/:projectId
// @access  Private (EPC Company or Admin)
exports.matchTechniciansForProject = async (req, res) => {
  try {
    const { projectId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(404).json({
        success: false,
        message: 'Invalid project ID format.',
      });
    }

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found.',
      });
    }

    // Fetch all active technicians
    const technicianProfiles = await TechnicianProfile.find()
      .populate('user', 'name email phone profilePhoto status');

    const validProfiles = technicianProfiles.filter(
      (tp) => tp.user && tp.user.status !== 'suspended'
    );

    // Fetch all existing applications for this project to know application status if applied
    const existingApplications = await Application.find({ project: projectId });

    // Fetch all certificates and assessments
    const techUserIds = validProfiles.map((p) => p.user._id);
    const [certificates, assessmentResults] = await Promise.all([
      Certificate.find({ technician: { $in: techUserIds } }),
      AssessmentResult.find({ technician: { $in: techUserIds } }),
    ]);

    // Calculate match scores
    const matchResults = [];

    for (const profile of validProfiles) {
      const techUser = profile.user;
      const techCerts = certificates.filter(
        (c) => c.technician.toString() === techUser._id.toString()
      );
      const techAssessments = assessmentResults.filter(
        (a) => a.technician.toString() === techUser._id.toString()
      );

      const { matchScore, breakdown } = await calculateMatchScore(
        project,
        techUser,
        profile,
        techCerts,
        techAssessments
      );

      const existingApp = existingApplications.find(
        (app) => app.technician.toString() === techUser._id.toString()
      );

      matchResults.push({
        technician: {
          id: techUser._id,
          name: techUser.name,
          email: techUser.email,
          phone: techUser.phone,
          profilePhoto: techUser.profilePhoto,
        },
        profile: {
          profession: profile.profession,
          yearsOfExperience: profile.yearsOfExperience,
          city: profile.city,
          state: profile.state,
          currentAvailability: profile.currentAvailability,
          expectedDailyRate: profile.expectedDailyRate,
          overallSkillScore: profile.overallSkillScore,
          averageRating: profile.averageRating,
          projectsCompleted: profile.projectsCompleted,
          renewableSkills: profile.renewableSkills,
          verifiedCertificatesCount: techCerts.filter((c) => c.status === 'Verified').length,
          verifiedCertificates: techCerts.filter((c) => c.status === 'Verified'),
        },
        matchScore,
        breakdown,
        applicationStatus: existingApp ? existingApp.status : null,
        applicationId: existingApp ? existingApp._id : null,
      });
    }

    // Sort descending by matchScore
    matchResults.sort((a, b) => b.matchScore - a.matchScore);

    res.status(200).json({
      success: true,
      project: {
        id: project._id,
        projectName: project.projectName,
        projectType: project.projectType,
        location: project.location,
        requiredSkills: project.requiredSkills,
        requiredCertifications: project.requiredCertifications,
        minimumExperience: project.minimumExperience,
        budget: project.budget,
        startDate: project.startDate,
        endDate: project.endDate,
      },
      count: matchResults.length,
      data: matchResults,
    });
  } catch (error) {
    console.error('[MatchTechniciansForProject Error]:', error);
    res.status(500).json({
      success: false,
      message: 'Server error calculating technician matching scores.',
    });
  }
};

// @desc    Get recommended projects for current logged-in technician
// @route   GET /api/matching/technician/recommended
// @access  Private (Technician)
exports.getRecommendedProjectsForTechnician = async (req, res) => {
  try {
    const technicianUser = req.user;
    const profile = await TechnicianProfile.findOne({ user: technicianUser._id });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Technician profile not found. Please complete profile first.',
      });
    }

    const [certificates, assessmentResults] = await Promise.all([
      Certificate.find({ technician: technicianUser._id }),
      AssessmentResult.find({ technician: technicianUser._id }),
    ]);
    const openProjects = await Project.find({ projectStatus: { $in: ['Open', 'In Progress'] } })
      .populate('company', 'name email phone')
      .sort('-createdAt');

    // Get current technician's applications to attach status
    const applications = await Application.find({ technician: technicianUser._id });

    const scoredProjects = [];

    for (const project of openProjects) {
      const { matchScore, breakdown } = await calculateMatchScore(
        project,
        technicianUser,
        profile,
        certificates,
        assessmentResults
      );

      const existingApp = applications.find(
        (app) => app.project.toString() === project._id.toString()
      );

      scoredProjects.push({
        project,
        matchScore,
        breakdown,
        hasApplied: !!existingApp,
        applicationStatus: existingApp ? existingApp.status : null,
        applicationId: existingApp ? existingApp._id : null,
      });
    }

    // Sort descending by matchScore
    scoredProjects.sort((a, b) => b.matchScore - a.matchScore);

    res.status(200).json({
      success: true,
      count: scoredProjects.length,
      data: scoredProjects,
    });
  } catch (error) {
    console.error('[GetRecommendedProjects Error]:', error);
    res.status(500).json({
      success: false,
      message: 'Server error calculating recommended projects.',
    });
  }
};
