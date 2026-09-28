const mongoose = require('mongoose');
const WorkforceAssignment = require('../models/WorkforceAssignment');
const Project = require('../models/Project');
const TechnicianProfile = require('../models/TechnicianProfile');
const User = require('../models/User');
const Notification = require('../models/Notification');
const Application = require('../models/Application');

// @desc    Get all workforce assignments for company's projects or technician's deployments
// @route   GET /api/workforce
// @access  Private (Technician, EPC Company, Admin)
exports.getCompanyWorkforce = async (req, res) => {
  try {
    const { projectId, status } = req.query;

    // If technician, return their personal assignments
    if (req.user.role === 'technician') {
      const techFilter = { technician: req.user._id };
      if (status && status !== 'All') techFilter.assignmentStatus = status;
      const assignments = await WorkforceAssignment.find(techFilter)
        .populate('project', 'projectName projectType location projectStatus progressPercentage companyName')
        .sort('-createdAt');
      return res.status(200).json({
        success: true,
        count: assignments.length,
        data: assignments,
      });
    }

    let projectQuery = {};

    if (req.user.role !== 'admin') {
      projectQuery.company = req.user._id;
    }

    if (projectId && projectId !== 'undefined' && projectId !== 'null' && mongoose.Types.ObjectId.isValid(projectId)) {
      projectQuery._id = projectId;
    }

    const companyProjects = await Project.find(projectQuery).select('_id projectName projectType location projectStatus progressPercentage');
    const projectIds = companyProjects.map((p) => p._id);

    const assignmentFilter = { project: { $in: projectIds } };
    if (status && status !== 'All') assignmentFilter.assignmentStatus = status;

    const assignments = await WorkforceAssignment.find(assignmentFilter)
      .populate('project', 'projectName projectType location projectStatus progressPercentage')
      .populate('technician', 'name email phone profilePhoto')
      .sort('-createdAt');

    const techUserIds = assignments.map((a) => a.technician?._id).filter(Boolean);
    const profiles = await TechnicianProfile.find({ user: { $in: techUserIds } });

    const enrichedRoster = assignments.map((assign) => {
      const p = profiles.find((prof) => prof.user.toString() === assign.technician?._id?.toString());
      return {
        ...assign.toObject(),
        technicianProfile: p,
      };
    });

    res.status(200).json({
      success: true,
      count: enrichedRoster.length,
      data: enrichedRoster,
    });
  } catch (error) {
    console.error('[GetCompanyWorkforce Error]:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving workforce roster.',
    });
  }
};

// @desc    Assign technician directly to project workforce
// @route   POST /api/workforce
// @access  Private (EPC Company or Admin)
exports.assignToWorkforce = async (req, res) => {
  try {
    const { projectId, technicianId, roleAssigned, dailyRateAgreed, startDate, endDate, notes } = req.body;

    if (!projectId || !technicianId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide projectId and technicianId.',
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
        message: 'Not authorized to manage workforce for this project.',
      });
    }

    let assignment = await WorkforceAssignment.findOne({
      project: projectId,
      technician: technicianId,
    });

    if (assignment) {
      assignment.assignmentStatus = 'Active';
      if (roleAssigned) assignment.roleAssigned = roleAssigned;
      if (dailyRateAgreed) assignment.dailyRateAgreed = Number(dailyRateAgreed);
      if (startDate) assignment.startDate = startDate;
      if (endDate) assignment.endDate = endDate;
      if (notes) assignment.notes = notes;
      await assignment.save();
    } else {
      assignment = await WorkforceAssignment.create({
        project: projectId,
        technician: technicianId,
        roleAssigned: roleAssigned || 'Solar Installer',
        assignmentStatus: 'Active',
        attendance: 'Present',
        workStatus: 'On Schedule',
        startDate: startDate || project.startDate,
        endDate: endDate || project.endDate,
        dailyRateAgreed: Number(dailyRateAgreed) || 1800,
        notes: notes || '',
      });

      project.hiredWorkersCount = (project.hiredWorkersCount || 0) + 1;
      if (project.projectStatus === 'Open') {
        project.projectStatus = 'In Progress';
      }
      await project.save();
    }

    // Synchronize application status if technician had applied
    await Application.findOneAndUpdate(
      { project: projectId, technician: technicianId },
      {
        status: 'Assigned',
        $push: {
          statusHistory: {
            status: 'Assigned',
            updatedAt: new Date(),
            note: `Hired and assigned to crew roster as ${roleAssigned || 'Technician'}`,
          },
        },
      }
    );

    // Update technician availability
    await TechnicianProfile.findOneAndUpdate(
      { user: technicianId },
      { currentAvailability: 'On Project' }
    );

    // Notify technician
    await Notification.create({
      recipient: technicianId,
      title: 'Assigned to Project Workforce 🎉',
      message: `You have been deployed as ${roleAssigned || 'Technician'} on "${project.projectName}". Daily rate: ₹${dailyRateAgreed || 1800}/day.`,
      type: 'workforce',
      link: '/technician/dashboard',
    });

    res.status(201).json({
      success: true,
      message: 'Technician successfully assigned to project workforce.',
      data: assignment,
    });
  } catch (error) {
    console.error('[AssignToWorkforce Error]:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error creating workforce assignment.',
    });
  }
};

// @desc    Get workforce roster for a project
// @route   GET /api/workforce/project/:projectId
// @access  Private (EPC Company, Technician assigned, Admin)
exports.getProjectWorkforce = async (req, res) => {
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

    const assignments = await WorkforceAssignment.find({ project: projectId })
      .populate('technician', 'name email phone profilePhoto')
      .sort('-createdAt');

    // Attach profile details for each technician
    const techUserIds = assignments.map((a) => a.technician?._id).filter(Boolean);
    const profiles = await TechnicianProfile.find({ user: { $in: techUserIds } });

    const enrichedRoster = assignments.map((assign) => {
      const p = profiles.find((prof) => prof.user.toString() === assign.technician?._id?.toString());
      return {
        ...assign.toObject(),
        technicianProfile: p,
      };
    });

    res.status(200).json({
      success: true,
      project: {
        id: project._id,
        projectName: project.projectName,
        projectType: project.projectType,
        location: project.location,
        progressPercentage: project.progressPercentage,
        projectStatus: project.projectStatus,
        numberWorkers: project.numberWorkers,
        hiredWorkersCount: project.hiredWorkersCount,
        startDate: project.startDate,
        endDate: project.endDate,
      },
      count: enrichedRoster.length,
      data: enrichedRoster,
    });
  } catch (error) {
    console.error('[GetProjectWorkforce Error]:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving project workforce.',
    });
  }
};

// @desc    Update workforce assignment (attendance, work status, status)
// @route   PUT /api/workforce/:id
// @access  Private (EPC Company or Admin)
exports.updateWorkforceAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const { assignmentStatus, attendance, workStatus, notes, totalDaysWorked } = req.body;

    const assignment = await WorkforceAssignment.findById(id).populate('project');
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Workforce assignment not found.',
      });
    }

    if (
      req.user.role !== 'admin' &&
      assignment.project.company.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to modify this workforce assignment.',
      });
    }

    if (assignmentStatus) assignment.assignmentStatus = assignmentStatus;
    if (attendance) assignment.attendance = attendance;
    if (workStatus) assignment.workStatus = workStatus;
    if (notes !== undefined) assignment.notes = notes;
    if (totalDaysWorked !== undefined) assignment.totalDaysWorked = Number(totalDaysWorked);

    await assignment.save();

    res.status(200).json({
      success: true,
      message: 'Workforce assignment updated.',
      data: assignment,
    });
  } catch (error) {
    console.error('[UpdateWorkforceAssignment Error]:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error updating workforce assignment.',
    });
  }
};

// @desc    Update project progress percentage (0, 25, 50, 75, 100%)
// @route   PUT /api/workforce/project/:projectId/progress
// @access  Private (EPC Company or Admin)
exports.updateProjectProgress = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { progressPercentage, projectStatus } = req.body;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found.',
      });
    }

    if (
      req.user.role !== 'admin' &&
      project.company.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update project progress.',
      });
    }

    if (progressPercentage !== undefined) {
      project.progressPercentage = Number(progressPercentage);
    }

    if (projectStatus) {
      project.projectStatus = projectStatus;
    } else if (project.progressPercentage === 100) {
      project.projectStatus = 'Completed';
    }

    await project.save();

    // If completed, release technicians to Available
    if (project.projectStatus === 'Completed') {
      const assignments = await WorkforceAssignment.find({ project: projectId });
      for (const a of assignments) {
        a.assignmentStatus = 'Completed';
        await a.save();
        await TechnicianProfile.findOneAndUpdate(
          { user: a.technician },
          {
            currentAvailability: 'Available',
            $inc: { projectsCompleted: 1 },
          }
        );
      }
    }

    res.status(200).json({
      success: true,
      message: `Project progress updated to ${project.progressPercentage}%. Status: ${project.projectStatus}.`,
      data: project,
    });
  } catch (error) {
    console.error('[UpdateProjectProgress Error]:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating project progress.',
    });
  }
};
