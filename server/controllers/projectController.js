const mongoose = require('mongoose');
const Project = require('../models/Project');
const CompanyProfile = require('../models/CompanyProfile');
const Application = require('../models/Application');
const WorkforceAssignment = require('../models/WorkforceAssignment');
const Notification = require('../models/Notification');
const TechnicianProfile = require('../models/TechnicianProfile');

// @desc    Create new EPC Project
// @route   POST /api/projects
// @access  Private (EPC Company)
exports.createProject = async (req, res) => {
  try {
    const {
      projectName,
      projectType,
      description,
      location,
      startDate,
      endDate,
      numberWorkers,
      workerRoles,
      requiredSkills,
      minimumExperience,
      requiredCertifications,
      budget,
      workType,
    } = req.body;

    if (!projectName || !projectType || !description || !location?.city || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, type, description, location (city/state), and dates.',
      });
    }

    // Get company profile to verify/extract name
    const companyProfile = await CompanyProfile.findOne({ user: req.user._id });
    const companyName = companyProfile ? companyProfile.companyName : req.user.name;

    const start = new Date(startDate);
    const end = new Date(endDate);
    const durationDays = Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)));

    const project = await Project.create({
      company: req.user._id,
      companyName,
      projectName,
      projectType,
      description,
      location: {
        city: location.city,
        state: location.state || 'Pan-India',
        address: location.address || '',
        siteName: location.siteName || `${projectName} Site`,
      },
      startDate: start,
      endDate: end,
      durationDays,
      numberWorkers: Number(numberWorkers) || 5,
      workerRoles: workerRoles || [
        { role: projectType === 'Solar' ? 'Solar Installer' : 'Wind Turbine Tech', count: Number(numberWorkers) || 5 },
      ],
      requiredSkills: requiredSkills && requiredSkills.length > 0 ? requiredSkills : ['PV Installation', 'Electrical Safety'],
      minimumExperience: Number(minimumExperience) || 2,
      requiredCertifications: requiredCertifications || (projectType === 'Solar' ? ['Solar PV Installer'] : ['GWO Basic Safety']),
      budget: Number(budget) || 250000,
      workType: workType || 'Full-time Contract',
      projectStatus: 'Open',
      progressPercentage: 0,
    });

    // Increment company's activeProjectsCount
    if (companyProfile) {
      companyProfile.activeProjectsCount += 1;
      await companyProfile.save();
    }

    // Notify matching technicians in background
    try {
      const matchingTechProfiles = await TechnicianProfile.find({
        currentAvailability: 'Available',
        'renewableSkills.category': projectType,
      }).limit(10).populate('user');

      for (const tp of matchingTechProfiles) {
        if (tp.user) {
          await Notification.create({
            recipient: tp.user._id,
            title: 'New Project Matching Your Skills!',
            message: `${companyName} just posted "${projectName}" in ${location.city}. Check recommended matches!`,
            type: 'project',
            link: `/technician/recommended`,
          });
        }
      }
    } catch (notifErr) {
      console.warn('[Matching notification warning]:', notifErr.message);
    }

    res.status(201).json({
      success: true,
      message: 'Project created successfully and published to marketplace.',
      data: project,
    });
  } catch (error) {
    console.error('[CreateProject Error]:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error creating project.',
    });
  }
};

// @desc    Get all projects with filtering
// @route   GET /api/projects
// @access  Public / Protected
exports.getProjects = async (req, res) => {
  try {
    const {
      projectType,
      city,
      state,
      status,
      search,
      companyId,
    } = req.query;

    const query = {};

    if (projectType) query.projectType = projectType;
    if (status) query.projectStatus = status;
    if (companyId && companyId !== 'undefined' && companyId !== 'null' && mongoose.Types.ObjectId.isValid(companyId)) {
      query.company = companyId;
    }
    if (city) query['location.city'] = new RegExp(city, 'i');
    if (state) query['location.state'] = new RegExp(state, 'i');

    if (search) {
      const term = search.toLowerCase();
      query.$or = [
        { projectName: new RegExp(term, 'i') },
        { companyName: new RegExp(term, 'i') },
        { description: new RegExp(term, 'i') },
        { 'location.city': new RegExp(term, 'i') },
        { requiredSkills: { $in: [new RegExp(term, 'i')] } },
      ];
    }

    const projects = await Project.find(query)
      .populate('company', 'name email phone')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: projects.length,
      data: projects,
    });
  } catch (error) {
    console.error('[GetProjects Error]:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving projects.',
    });
  }
};

// @desc    Get project by ID with full applicant and workforce context
// @route   GET /api/projects/:id
// @access  Public / Protected
exports.getProjectById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({
        success: false,
        message: 'Invalid project ID format.',
      });
    }

    const project = await Project.findById(req.params.id).populate('company', 'name email phone');

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found.',
      });
    }

    // Fetch applications count
    const applicationsCount = await Application.countDocuments({ project: project._id });
    
    // Fetch workforce assignments
    const workforce = await WorkforceAssignment.find({ project: project._id })
      .populate('technician', 'name email phone profilePhoto');

    res.status(200).json({
      success: true,
      data: {
        project,
        applicationsCount,
        workforce,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error retrieving project details.',
    });
  }
};

// @desc    Update project details or status / progress
// @route   PUT /api/projects/:id
// @access  Private (EPC Company or Admin)
exports.updateProject = async (req, res) => {
  try {
    let project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found.',
      });
    }

    // Verify ownership if not admin
    if (req.user.role !== 'admin' && project.company.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this project.',
      });
    }

    const {
      projectName,
      description,
      location,
      startDate,
      endDate,
      requiredSkills,
      minimumExperience,
      budget,
      projectStatus,
      progressPercentage,
      numberWorkers,
    } = req.body;

    if (projectName) project.projectName = projectName;
    if (description) project.description = description;
    if (location) project.location = { ...project.location, ...location };
    if (startDate) project.startDate = startDate;
    if (endDate) project.endDate = endDate;
    if (requiredSkills) project.requiredSkills = requiredSkills;
    if (minimumExperience !== undefined) project.minimumExperience = Number(minimumExperience);
    if (budget !== undefined) project.budget = Number(budget);
    if (projectStatus) project.projectStatus = projectStatus;
    if (progressPercentage !== undefined) project.progressPercentage = Number(progressPercentage);
    if (numberWorkers !== undefined) project.numberWorkers = Number(numberWorkers);

    await project.save();

    res.status(200).json({
      success: true,
      message: 'Project updated successfully.',
      data: project,
    });
  } catch (error) {
    console.error('[UpdateProject Error]:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error updating project.',
    });
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private (EPC Company or Admin)
exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found.',
      });
    }

    if (req.user.role !== 'admin' && project.company.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this project.',
      });
    }

    await project.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Project deleted successfully.',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error deleting project.',
    });
  }
};
