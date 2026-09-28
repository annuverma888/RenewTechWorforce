const User = require('../models/User');
const TechnicianProfile = require('../models/TechnicianProfile');
const CompanyProfile = require('../models/CompanyProfile');
const Certificate = require('../models/Certificate');
const Project = require('../models/Project');
const Application = require('../models/Application');
const WorkforceAssignment = require('../models/WorkforceAssignment');

const AssessmentResult = require('../models/AssessmentResult');
const Review = require('../models/Review');

// @desc    Get Admin platform statistics
// @route   GET /api/admin/statistics
// @access  Private (Admin)
exports.getAdminStatistics = async (req, res) => {
  try {
    const totalTechnicians = await User.countDocuments({ role: 'technician' });
    const verifiedTechnicians = await TechnicianProfile.countDocuments({ verifiedCertificatesCount: { $gt: 0 } });
    const totalCompanies = await User.countDocuments({ role: 'epc_company' });
    const activeProjects = await Project.countDocuments({ projectStatus: { $in: ['Open', 'In Progress'] } });
    const completedProjects = await Project.countDocuments({ projectStatus: 'Completed' });
    const successfulHires = await WorkforceAssignment.countDocuments();
    const pendingCertificates = await Certificate.countDocuments({ status: 'Pending' });
    const totalApplications = await Application.countDocuments();

    // Renewable energy split
    const solarProjects = await Project.countDocuments({ projectType: 'Solar' });
    const windProjects = await Project.countDocuments({ projectType: 'Wind' });

    // Financial calculations
    const allProjects = await Project.find().select('budget');
    const totalProjectBudget = allProjects.reduce((acc, p) => acc + (p.budget || 0), 0);

    const techProfiles = await TechnicianProfile.find().select('expectedDailyRate overallSkillScore');
    const avgDailyRate = techProfiles.length > 0
      ? Math.round(techProfiles.reduce((acc, t) => acc + (t.expectedDailyRate || 0), 0) / techProfiles.length)
      : 0;

    res.status(200).json({
      success: true,
      data: {
        totalTechnicians,
        verifiedTechnicians,
        totalCompanies,
        activeProjects,
        completedProjects,
        successfulHires,
        pendingCertificates,
        totalApplications,
        totalProjectBudget,
        avgDailyRate,
        renewableSplit: {
          solar: solarProjects,
          wind: windProjects,
        },
      },
    });
  } catch (error) {
    console.error('[AdminStats Error]:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving admin statistics.',
    });
  }
};

// @desc    Get In-Depth Platform Analytics
// @route   GET /api/admin/analytics
// @access  Private (Admin)
exports.getAdminAnalytics = async (req, res) => {
  try {
    const [
      technicians,
      companies,
      techProfiles,
      companyProfiles,
      projects,
      applications,
      assignments,
      certificates,
      assessments,
      reviews,
    ] = await Promise.all([
      User.find({ role: 'technician' }).select('name email status createdAt'),
      User.find({ role: 'epc_company' }).select('name email status createdAt'),
      TechnicianProfile.find().populate('user', 'name email status createdAt'),
      CompanyProfile.find().populate('user', 'name email status createdAt'),
      Project.find().populate('company', 'name'),
      Application.find().populate('technician', 'name email').populate('project', 'projectName'),
      WorkforceAssignment.find().populate('technician', 'name').populate('project', 'projectName'),
      Certificate.find().populate('technician', 'name email'),
      AssessmentResult.find().populate('technician', 'name email'),
      Review.find().populate('technician', 'name').populate('company', 'name'),
    ]);

    // 1. Monthly Growth Timeline (Last 6 Months)
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    const monthlyGrowth = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mIdx = d.getMonth();
      const yr = d.getFullYear();
      const label = `${monthNames[mIdx]} ${yr.toString().slice(-2)}`;

      const start = new Date(yr, mIdx, 1);
      const end = new Date(yr, mIdx + 1, 0, 23, 59, 59, 999);

      const techsInMonth = technicians.filter((t) => t.createdAt >= start && t.createdAt <= end).length;
      const compsInMonth = companies.filter((c) => c.createdAt >= start && c.createdAt <= end).length;
      const projsInMonth = projects.filter((p) => p.createdAt >= start && p.createdAt <= end).length;
      const hiresInMonth = assignments.filter((a) => a.createdAt >= start && a.createdAt <= end).length;

      monthlyGrowth.push({
        month: label,
        technicians: techsInMonth,
        companies: compsInMonth,
        projects: projsInMonth,
        hires: hiresInMonth,
      });
    }

    // 2. Sector & Capacity Breakdown
    const sectorStats = {
      Solar: { count: 0, budget: 0, open: 0 },
      Wind: { count: 0, budget: 0, open: 0 },
      Hybrid: { count: 0, budget: 0, open: 0 },
      Storage: { count: 0, budget: 0, open: 0 },
      Other: { count: 0, budget: 0, open: 0 },
    };

    projects.forEach((p) => {
      const type = sectorStats[p.projectType] ? p.projectType : 'Other';
      sectorStats[type].count += 1;
      sectorStats[type].budget += p.budget || 0;
      if (['Open', 'In Progress'].includes(p.projectStatus)) {
        sectorStats[type].open += 1;
      }
    });

    const sectorBreakdown = Object.keys(sectorStats)
      .map((type) => ({
        sector: type,
        projectsCount: sectorStats[type].count,
        totalBudget: sectorStats[type].budget,
        activeProjects: sectorStats[type].open,
        percentage: projects.length > 0 ? Math.round((sectorStats[type].count / projects.length) * 100) : 0,
      }))
      .filter((s) => s.projectsCount > 0);

    // 3. Regional Geographical Footprint
    const regionMap = {};
    techProfiles.forEach((tp) => {
      const state = tp.state || 'Other';
      if (!regionMap[state]) {
        regionMap[state] = { state, technicians: 0, projects: 0 };
      }
      regionMap[state].technicians += 1;
    });

    projects.forEach((p) => {
      let state = 'Other';
      if (p.location) {
        if (typeof p.location === 'object' && p.location.state) {
          state = p.location.state;
        } else if (typeof p.location === 'string') {
          const parts = p.location.split(',');
          state = parts[parts.length - 1]?.trim() || 'Other';
        }
      }
      if (!regionMap[state]) {
        regionMap[state] = { state, technicians: 0, projects: 0 };
      }
      regionMap[state].projects += 1;
    });

    const regionalBreakdown = Object.values(regionMap)
      .sort((a, b) => b.technicians + b.projects - (a.technicians + a.projects))
      .slice(0, 8);

    // 4. Skills Intelligence & Demand vs Supply Gap Analysis
    const demandSkills = {};
    projects.forEach((p) => {
      (p.requiredSkills || []).forEach((sk) => {
        const skillName = typeof sk === 'object' && sk !== null ? sk.name : sk;
        if (skillName && typeof skillName === 'string') {
          const cleaned = skillName.trim();
          demandSkills[cleaned] = (demandSkills[cleaned] || 0) + 1;
        }
      });
    });

    const supplySkills = {};
    techProfiles.forEach((tp) => {
      (tp.renewableSkills || []).forEach((sk) => {
        const skillName = typeof sk === 'object' && sk !== null ? sk.name : sk;
        if (skillName && typeof skillName === 'string') {
          const cleaned = skillName.trim();
          supplySkills[cleaned] = (supplySkills[cleaned] || 0) + 1;
        }
      });
    });

    const allDistinctSkills = Array.from(new Set([...Object.keys(demandSkills), ...Object.keys(supplySkills)]));
    const skillsGapAnalysis = allDistinctSkills
      .map((skill) => {
        const demand = demandSkills[skill] || 0;
        const supply = supplySkills[skill] || 0;
        const netGap = demand - supply; // positive = shortage, negative = surplus
        return {
          skill,
          demand,
          supply,
          gap: netGap,
          status: netGap > 0 ? 'High Demand / Shortage' : netGap === 0 ? 'Balanced' : 'Adequate Supply',
        };
      })
      .sort((a, b) => b.demand - a.demand)
      .slice(0, 10);

    // 5. Application & Hiring Funnel
    const funnel = {
      Applied: applications.filter((a) => a.status === 'Applied').length,
      Shortlisted: applications.filter((a) => a.status === 'Shortlisted').length,
      Interviewing: applications.filter((a) => a.status === 'Interviewing').length,
      Hired: applications.filter((a) => a.status === 'Hired').length,
      Rejected: applications.filter((a) => a.status === 'Rejected').length,
      Total: applications.length,
    };

    const avgMatchScore = applications.length > 0
      ? Math.round(applications.reduce((acc, a) => acc + (a.matchScore || 0), 0) / applications.length)
      : 0;

    const conversionRate = applications.length > 0
      ? +((funnel.Hired / applications.length) * 100).toFixed(1)
      : 0;

    // 6. Assessment Competency Metrics
    const skillLevelCounts = {
      Novice: 0,
      Competent: 0,
      Proficient: 0,
      Master: 0,
    };

    assessments.forEach((a) => {
      if (skillLevelCounts[a.skillLevel] !== undefined) {
        skillLevelCounts[a.skillLevel] += 1;
      }
    });

    const avgAssessmentScore = assessments.length > 0
      ? Math.round(assessments.reduce((acc, a) => acc + (a.scorePercentage || 0), 0) / assessments.length)
      : 0;

    const passedAssessmentsCount = assessments.filter((a) => a.passed).length;
    const assessmentPassRate = assessments.length > 0
      ? Math.round((passedAssessmentsCount / assessments.length) * 100)
      : 0;

    // 7. Compliance & Certification Audits
    const certStats = {
      total: certificates.length,
      pending: certificates.filter((c) => c.status === 'Pending').length,
      verified: certificates.filter((c) => c.status === 'Verified').length,
      rejected: certificates.filter((c) => c.status === 'Rejected').length,
    };

    const auditApprovalRate = certStats.verified + certStats.rejected > 0
      ? Math.round((certStats.verified / (certStats.verified + certStats.rejected)) * 100)
      : 100;

    const issuingOrgCounts = {};
    certificates.forEach((c) => {
      const org = c.issuingOrganization?.trim() || 'Unknown';
      issuingOrgCounts[org] = (issuingOrgCounts[org] || 0) + 1;
    });

    const topIssuingBodies = Object.entries(issuingOrgCounts)
      .map(([org, count]) => ({ org, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // 8. Quality & Rating Metrics
    const avgOverallRating = reviews.length > 0
      ? +(reviews.reduce((acc, r) => acc + (r.overallRating || 0), 0) / reviews.length).toFixed(1)
      : 5.0;

    // 9. Consolidated Recent Activity Stream
    const activities = [];

    // Latest certificates
    certificates.slice(0, 5).forEach((c) => {
      activities.push({
        id: `cert-${c._id}`,
        type: 'certificate',
        title: `Certificate ${c.status}`,
        description: `"${c.certificateName}" submitted by ${c.technician?.name || 'Technician'} (${c.issuingOrganization})`,
        status: c.status,
        timestamp: c.updatedAt || c.createdAt,
      });
    });

    // Latest hires
    assignments.slice(0, 5).forEach((w) => {
      activities.push({
        id: `hire-${w._id}`,
        type: 'hire',
        title: 'Technician Deployed',
        description: `${w.technician?.name || 'Technician'} assigned to "${w.project?.projectName || 'Clean Energy Project'}" as ${w.assignedRole}`,
        status: 'Active',
        timestamp: w.createdAt,
      });
    });

    // Latest projects
    projects.slice(0, 5).forEach((p) => {
      const locStr =
        p.location && typeof p.location === 'object'
          ? `${p.location.city || ''}, ${p.location.state || ''}`
          : (p.location || 'India');
      activities.push({
        id: `proj-${p._id}`,
        type: 'project',
        title: 'New Project Commissioned',
        description: `"${p.projectName}" (${p.projectType}, ${locStr}) posted by ${p.company?.name || 'EPC Company'}`,
        status: p.projectStatus,
        timestamp: p.createdAt,
      });
    });

    // Latest assessments
    assessments.slice(0, 5).forEach((a) => {
      activities.push({
        id: `assess-${a._id}`,
        type: 'assessment',
        title: 'Skill Assessment Completed',
        description: `${a.technician?.name || 'Technician'} scored ${a.scorePercentage}% (${a.skillLevel}) in ${a.assessmentTitle}`,
        status: a.skillLevel,
        timestamp: a.completedAt || a.createdAt,
      });
    });

    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    const recentActivityStream = activities.slice(0, 15);

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalTechnicians: technicians.length,
          verifiedTechnicians: techProfiles.filter((tp) => tp.verifiedCertificatesCount > 0).length,
          totalCompanies: companies.length,
          activeProjects: projects.filter((p) => ['Open', 'In Progress'].includes(p.projectStatus)).length,
          totalProjects: projects.length,
          successfulHires: assignments.length,
          totalApplications: applications.length,
          totalProjectBudget: projects.reduce((acc, p) => acc + (p.budget || 0), 0),
          averageDailyRate: techProfiles.length > 0
            ? Math.round(techProfiles.reduce((acc, t) => acc + (t.expectedDailyRate || 0), 0) / techProfiles.length)
            : 1800,
          avgOverallRating,
          conversionRate,
          avgMatchScore,
        },
        monthlyGrowth,
        sectorBreakdown,
        regionalBreakdown,
        skillsGapAnalysis,
        funnel,
        assessmentMetrics: {
          totalTaken: assessments.length,
          avgScore: avgAssessmentScore,
          passRate: assessmentPassRate,
          skillLevelDistribution: skillLevelCounts,
        },
        complianceAuditMetrics: {
          ...certStats,
          auditApprovalRate,
          topIssuingBodies,
        },
        recentActivityStream,
      },
    });
  } catch (error) {
    console.error('[AdminAnalytics Error]:', error);
    res.status(500).json({
      success: false,
      message: 'Server error generating platform analytics.',
    });
  }
};

// @desc    Get all technicians for management
// @route   GET /api/admin/technicians
// @access  Private (Admin)
exports.getAdminTechnicians = async (req, res) => {
  try {
    const technicians = await User.find({ role: 'technician' })
      .select('-password')
      .sort('-createdAt');

    const profiles = await TechnicianProfile.find();
    const certs = await Certificate.find();

    const data = technicians.map((u) => {
      const p = profiles.find((prof) => prof.user.toString() === u._id.toString());
      const userCerts = certs.filter((c) => c.technician.toString() === u._id.toString());
      return {
        user: u,
        profile: p,
        certificatesCount: userCerts.length,
        verifiedCertificatesCount: userCerts.filter((c) => c.status === 'Verified').length,
      };
    });

    res.status(200).json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error retrieving technicians list for admin.',
    });
  }
};

// @desc    Get all EPC companies for management
// @route   GET /api/admin/companies
// @access  Private (Admin)
exports.getAdminCompanies = async (req, res) => {
  try {
    const companies = await User.find({ role: 'epc_company' })
      .select('-password')
      .sort('-createdAt');

    const profiles = await CompanyProfile.find();
    const projects = await Project.find();

    const data = companies.map((u) => {
      const p = profiles.find((prof) => prof.user.toString() === u._id.toString());
      const companyProjects = projects.filter((proj) => proj.company.toString() === u._id.toString());
      return {
        user: u,
        profile: p,
        projectsCount: companyProjects.length,
        activeProjects: companyProjects.filter((cp) => cp.projectStatus !== 'Completed').length,
      };
    });

    res.status(200).json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error retrieving companies list for admin.',
    });
  }
};

// @desc    Suspend or activate user
// @route   PUT /api/admin/users/:id/status
// @access  Private (Admin)
exports.toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['active', 'suspended'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be active or suspended.',
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    user.status = status;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User status changed to ${status}.`,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        status: user.status,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error updating user status.',
    });
  }
};
