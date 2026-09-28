const mongoose = require('mongoose');
const Application = require('../models/Application');
const Project = require('../models/Project');
const TechnicianProfile = require('../models/TechnicianProfile');
const Certificate = require('../models/Certificate');
const Notification = require('../models/Notification');
const WorkforceAssignment = require('../models/WorkforceAssignment');
const { calculateMatchScore } = require('../services/matchingEngine');

// @desc    Apply to project
// @route   POST /api/applications
// @access  Private (Technician)
exports.applyToProject = async (req, res) => {
  try {
    const { projectId, coverNote } = req.body;

    if (!projectId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide projectId to apply.',
      });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found.',
      });
    }

    if (project.projectStatus !== 'Open') {
      return res.status(400).json({
        success: false,
        message: `Project is currently ${project.projectStatus} and not accepting new applications.`,
      });
    }

    // Check for existing application
    const existing = await Application.findOne({
      project: projectId,
      technician: req.user._id,
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied to this renewable energy project.',
      });
    }

    // Calculate match score at submission
    const profile = await TechnicianProfile.findOne({ user: req.user._id });
    const certificates = await Certificate.find({ technician: req.user._id });

    const { matchScore, breakdown } = await calculateMatchScore(
      project,
      req.user,
      profile || {},
      certificates
    );

    const application = await Application.create({
      project: projectId,
      technician: req.user._id,
      coverNote: coverNote || 'Excited to deploy certified renewable skills on this project.',
      matchScore,
      matchBreakdown: breakdown,
      status: 'Applied',
      statusHistory: [
        {
          status: 'Applied',
          updatedAt: new Date(),
          note: 'Application submitted by technician.',
        },
      ],
    });

    // Notify EPC Company
    await Notification.create({
      recipient: project.company,
      title: 'New Technician Application Received',
      message: `${req.user.name} (${matchScore}% match) applied for "${project.projectName}".`,
      type: 'application',
      link: `/epc/projects/${project._id}`,
    });

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully.',
      data: application,
    });
  } catch (error) {
    console.error('[ApplyToProject Error]:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error submitting application.',
    });
  }
};

// @desc    Get applications (filtered by project, technician, or company)
// @route   GET /api/applications
// @access  Private
exports.getApplications = async (req, res) => {
  try {
    const { projectId, status, technicianId } = req.query;
    const filter = {};

    const validProjectId = projectId && projectId !== 'undefined' && projectId !== 'null' && mongoose.Types.ObjectId.isValid(projectId)
      ? projectId
      : null;

    if (validProjectId) filter.project = validProjectId;
    if (technicianId && mongoose.Types.ObjectId.isValid(technicianId)) {
      filter.technician = technicianId;
    }

    if (status && status !== 'All') {
      if (status === 'Hired') {
        filter.status = { $in: ['Hired', 'Assigned', 'Selected'] };
      } else if (status === 'Interview' || status === 'Interviewing') {
        filter.status = { $in: ['Interview', 'Interviewing'] };
      } else {
        filter.status = status;
      }
    }

    // Role-based visibility
    if (req.user.role === 'technician') {
      filter.technician = req.user._id;
    } else if (req.user.role === 'epc_company') {
      // Find projects owned by this company
      const companyProjects = await Project.find({ company: req.user._id }).select('_id');
      const projectIds = companyProjects.map((p) => p._id.toString());
      if (validProjectId) {
        if (!projectIds.includes(validProjectId.toString())) {
          return res.status(200).json({ success: true, count: 0, data: [] });
        }
        filter.project = validProjectId;
      } else {
        filter.project = { $in: projectIds };
      }
    }

    const applications = await Application.find(filter)
      .populate('project', 'projectName projectType location startDate endDate budget projectStatus companyName')
      .populate('technician', 'name email phone profilePhoto')
      .sort('-appliedAt');

    // Populate technician profile metadata for company view
    const techUserIds = applications.map((a) => a.technician?._id).filter(Boolean);
    const techProfiles = await TechnicianProfile.find({ user: { $in: techUserIds } });
    const verifiedCerts = await Certificate.find({ technician: { $in: techUserIds }, status: 'Verified' });

    const enrichedApplications = applications.map((app) => {
      const p = techProfiles.find((tp) => tp.user.toString() === app.technician?._id?.toString());
      const certs = verifiedCerts.filter((c) => c.technician.toString() === app.technician?._id?.toString());
      return {
        ...app.toObject(),
        technicianProfile: p,
        verifiedCertificates: certs,
      };
    });

    res.status(200).json({
      success: true,
      count: enrichedApplications.length,
      data: enrichedApplications,
    });
  } catch (error) {
    console.error('[GetApplications Error]:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving applications.',
    });
  }
};

// @desc    Update application status (Company / Admin workflow)
// @route   PUT /api/applications/:id/status
// @access  Private (EPC Company or Admin)
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, note, roleAssigned, dailyRateAgreed, startDate, endDate } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        message: 'Invalid application ID format.',
      });
    }

    const validStatuses = [
      'Applied',
      'Shortlisted',
      'Interview',
      'Interviewing',
      'Selected',
      'Hired',
      'Rejected',
      'Assigned',
      'Completed',
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const application = await Application.findById(id)
      .populate('project')
      .populate('technician', 'name email phone');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found.',
      });
    }

    // Verify company ownership if not admin
    if (
      req.user.role !== 'admin' &&
      application.project.company.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update application for this project.',
      });
    }

    application.status = status;
    application.statusHistory.push({
      status,
      updatedAt: new Date(),
      note: note || `Application moved to ${status}`,
    });

    await application.save();

    // Notification messages per status
    let notifTitle = 'Application Update';
    let notifMessage = `Your application for "${application.project.projectName}" status is now: ${status}.`;

    if (status === 'Shortlisted') {
      notifTitle = 'Application Shortlisted! ⭐';
      notifMessage = `Congratulations! You have been shortlisted for "${application.project.projectName}" by ${application.project.companyName}.`;
    } else if (status === 'Interview' || status === 'Interviewing') {
      notifTitle = 'Interview Scheduled 🗓️';
      notifMessage = `The EPC team at ${application.project.companyName} wants to interview you for "${application.project.projectName}".`;
    } else if (status === 'Selected' || status === 'Assigned' || status === 'Hired') {
      notifTitle = 'You are Hired! 🎉';
      notifMessage = `You have been selected and hired for "${application.project.projectName}". Daily rate: ₹${dailyRateAgreed || 1800}/day. Welcome to the crew!`;

      // Auto-create or activate WorkforceAssignment
      const existingAssignment = await WorkforceAssignment.findOne({
        project: application.project._id,
        technician: application.technician._id,
      });

      if (!existingAssignment) {
        await WorkforceAssignment.create({
          project: application.project._id,
          technician: application.technician._id,
          roleAssigned: roleAssigned || application.project.workerRoles?.[0]?.role || 'Solar PV Wireman',
          assignmentStatus: 'Active',
          attendance: 'Present',
          workStatus: 'On Schedule',
          startDate: startDate || application.project.startDate,
          endDate: endDate || application.project.endDate,
          dailyRateAgreed: Number(dailyRateAgreed) || 1800,
          notes: note || 'Hired from applicant pool',
        });

        // Update project hired count
        application.project.hiredWorkersCount = (application.project.hiredWorkersCount || 0) + 1;
        if (application.project.projectStatus === 'Open') {
          application.project.projectStatus = 'In Progress';
        }
        await application.project.save();

        // Update technician availability
        await TechnicianProfile.findOneAndUpdate(
          { user: application.technician._id },
          { currentAvailability: 'On Project' }
        );
      }
    }

    await Notification.create({
      recipient: application.technician._id,
      title: notifTitle,
      message: notifMessage,
      type: 'application',
      link: '/technician/applications',
    });

    res.status(200).json({
      success: true,
      message: `Application status updated to ${status}.`,
      data: application,
    });
  } catch (error) {
    console.error('[UpdateApplicationStatus Error]:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error updating application status.',
    });
  }
};

// @desc    Get single application by ID
// @route   GET /api/applications/:id
// @access  Private
exports.getApplicationById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ success: false, message: 'Invalid application ID format.' });
    }

    const application = await Application.findById(id)
      .populate('project')
      .populate('technician', 'name email phone profilePhoto');

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    // Authorization: technician applicant, EPC project owner, or admin
    const isOwner = application.technician?._id?.toString() === req.user._id.toString();
    const isProjectCompany = application.project?.company?.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isProjectCompany && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this application.' });
    }

    const profile = await TechnicianProfile.findOne({ user: application.technician._id });
    const certificates = await Certificate.find({ technician: application.technician._id, status: 'Verified' });

    res.status(200).json({
      success: true,
      data: {
        ...application.toObject(),
        technicianProfile: profile,
        verifiedCertificates: certificates,
      },
    });
  } catch (error) {
    console.error('[GetApplicationById Error]:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving application details.' });
  }
};

// @desc    Withdraw application (Technician)
// @route   DELETE /api/applications/:id
// @access  Private (Technician)
exports.withdrawApplication = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ success: false, message: 'Invalid application ID format.' });
    }

    const application = await Application.findOne({
      _id: id,
      technician: req.user._id,
    });

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found or not owned by you.' });
    }

    if (['Hired', 'Selected', 'Assigned'].includes(application.status)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot withdraw an application that has already been accepted/hired.',
      });
    }

    await Application.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Application withdrawn successfully.',
    });
  } catch (error) {
    console.error('[WithdrawApplication Error]:', error);
    res.status(500).json({ success: false, message: 'Server error withdrawing application.' });
  }
};

