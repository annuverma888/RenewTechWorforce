const mongoose = require('mongoose');
const User = require('../models/User');
const TechnicianProfile = require('../models/TechnicianProfile');
const Certificate = require('../models/Certificate');
const AssessmentResult = require('../models/AssessmentResult');
const Review = require('../models/Review');
const WorkforceAssignment = require('../models/WorkforceAssignment');

// @desc    Get all technicians with advanced filtering
// @route   GET /api/technicians
// @access  Public / Protected
exports.getTechnicians = async (req, res) => {
  try {
    const {
      skill,
      location,
      experience,
      certification,
      availability,
      minSkillScore,
      minRating,
      category, // Solar or Wind
      search,
    } = req.query;

    const query = {};

    // Availability filter
    if (availability && availability !== 'All') {
      query.currentAvailability = availability;
    }

    // Experience filter (minimum years)
    if (experience && !isNaN(Number(experience))) {
      query.yearsOfExperience = { $gte: Number(experience) };
    }

    // Minimum skill score
    if (minSkillScore && !isNaN(Number(minSkillScore))) {
      query.overallSkillScore = { $gte: Number(minSkillScore) };
    }

    // Minimum rating
    if (minRating && !isNaN(Number(minRating))) {
      query.averageRating = { $gte: Number(minRating) };
    }

    // Location filter (city or state or preferredWorkLocations)
    if (location) {
      const locRegex = new RegExp(location, 'i');
      query.$or = [
        { city: locRegex },
        { state: locRegex },
        { preferredWorkLocations: { $in: [locRegex] } },
      ];
    }

    // Skill filter
    if (skill) {
      query['renewableSkills.name'] = new RegExp(skill, 'i');
    }

    // Category filter (Solar / Wind)
    if (category) {
      query['renewableSkills.category'] = category;
    }

    let profiles = await TechnicianProfile.find(query).populate('user', 'name email phone profilePhoto status');

    // Filter out inactive/suspended users
    profiles = profiles.filter((p) => p.user && p.user.status !== 'suspended');

    // Keyword search filter across name, profession, bio
    if (search) {
      const term = search.toLowerCase();
      profiles = profiles.filter(
        (p) =>
          p.user?.name?.toLowerCase().includes(term) ||
          p.profession?.toLowerCase().includes(term) ||
          p.city?.toLowerCase().includes(term) ||
          p.renewableSkills?.some((s) => s.name.toLowerCase().includes(term))
      );
    }

    // Optional certification filter
    if (certification) {
      const certTechIds = await Certificate.find({
        certificateName: new RegExp(certification, 'i'),
        status: 'Verified',
      }).distinct('technician');

      profiles = profiles.filter((p) => certTechIds.some((id) => id.toString() === p.user._id.toString()));
    }

    // Attach verified certificates summary to each technician profile
    const techUserIds = profiles.map((p) => p.user._id);
    const verifiedCerts = await Certificate.find({
      technician: { $in: techUserIds },
      status: 'Verified',
    });

    const results = profiles.map((p) => {
      const userCerts = verifiedCerts.filter(
        (c) => c.technician.toString() === p.user._id.toString()
      );
      return {
        ...p.toObject(),
        verifiedCertificates: userCerts,
      };
    });

    res.status(200).json({
      success: true,
      count: results.length,
      data: results,
    });
  } catch (error) {
    console.error('[GetTechnicians Error]:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving technicians list.',
    });
  }
};

// @desc    Get technician by ID (User ID or Profile ID)
// @route   GET /api/technicians/:id
// @access  Public / Protected
exports.getTechnicianById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        message: 'Invalid technician ID format.',
      });
    }

    // Check if id matches user or profile
    let profile = await TechnicianProfile.findOne({
      $or: [{ _id: id }, { user: id }],
    }).populate('user', 'name email phone profilePhoto status createdAt');

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Technician profile not found.',
      });
    }

    const userId = profile.user._id;

    // Fetch verified and pending certificates
    const certificates = await Certificate.find({ technician: userId });

    // Fetch assessment results
    const assessments = await AssessmentResult.find({ technician: userId }).sort('-completedAt');

    // Fetch reviews from EPC companies
    const reviews = await Review.find({ technician: userId })
      .populate('company', 'name')
      .populate('project', 'projectName location')
      .sort('-createdAt');

    // Fetch completed work assignments
    const completedAssignments = await WorkforceAssignment.find({
      technician: userId,
      assignmentStatus: 'Completed',
    }).populate('project', 'projectName projectType location budget');

    res.status(200).json({
      success: true,
      data: {
        profile,
        certificates,
        assessments,
        reviews,
        completedAssignments,
      },
    });
  } catch (error) {
    console.error('[GetTechnicianById Error]:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving technician profile.',
    });
  }
};

// @desc    Update current technician's profile
// @route   PUT /api/technicians/profile
// @access  Private (Technician)
exports.updateProfile = async (req, res) => {
  try {
    let profile = await TechnicianProfile.findOne({ user: req.user._id });

    if (!profile) {
      profile = new TechnicianProfile({ user: req.user._id });
    }

    const {
      profession,
      yearsOfExperience,
      currentAvailability,
      expectedDailyRate,
      expectedMonthlyRate,
      city,
      state,
      preferredWorkLocations,
      renewableSkills,
      previousProjects,
      bio,
      profilePhoto,
      phone,
    } = req.body;

    if (profession !== undefined) profile.profession = profession.trim();
    if (yearsOfExperience !== undefined) profile.yearsOfExperience = Number(yearsOfExperience) || 0;
    if (currentAvailability !== undefined) profile.currentAvailability = currentAvailability;
    if (expectedDailyRate !== undefined) {
      profile.expectedDailyRate = expectedDailyRate === '' || expectedDailyRate === null ? null : Number(expectedDailyRate);
    }
    if (expectedMonthlyRate !== undefined) {
      profile.expectedMonthlyRate = expectedMonthlyRate === '' || expectedMonthlyRate === null ? null : Number(expectedMonthlyRate);
    }
    if (city !== undefined) profile.city = city.trim();
    if (state !== undefined) profile.state = state.trim();
    if (preferredWorkLocations !== undefined) profile.preferredWorkLocations = preferredWorkLocations;
    if (previousProjects !== undefined) profile.previousProjects = previousProjects;
    if (bio !== undefined) profile.bio = bio.trim();

    if (renewableSkills !== undefined && Array.isArray(renewableSkills)) {
      // Secure skills against unverified client-side claims:
      // Keep verified status only if skill already existed and was verified by Assessment / Certificate / Admin.
      // Newly added or unverified skills are strictly isVerified: false, verificationSource: 'Added by technician'
      const existingSkills = profile.renewableSkills || [];
      profile.renewableSkills = renewableSkills.map((incoming) => {
        const existingMatch = existingSkills.find(
          (ex) => ex.name && incoming.name && ex.name.trim().toLowerCase() === incoming.name.trim().toLowerCase()
        );
        if (existingMatch && existingMatch.isVerified) {
          return {
            name: incoming.name.trim(),
            category: incoming.category || existingMatch.category || 'Solar',
            proficiency: incoming.proficiency || existingMatch.proficiency || 'Intermediate',
            isVerified: true,
            verificationSource: existingMatch.verificationSource || 'Assessment',
            verifiedAt: existingMatch.verifiedAt || new Date(),
          };
        }
        return {
          name: incoming.name.trim(),
          category: incoming.category || 'Solar',
          proficiency: incoming.proficiency || 'Intermediate',
          isVerified: false,
          verificationSource: 'Added by technician',
          verifiedAt: null,
        };
      });
    }

    // Count verified certificates
    const verifiedCertsCount = await Certificate.countDocuments({
      technician: req.user._id,
      status: 'Verified',
    });
    profile.verifiedCertificatesCount = verifiedCertsCount;

    // Recalculate completion %
    profile.calculateProfileCompletion();

    await profile.save();

    // Also update User profilePhoto and phone if provided
    if (profilePhoto || phone) {
      const userUpdates = {};
      if (profilePhoto) userUpdates.profilePhoto = profilePhoto;
      if (phone) userUpdates.phone = phone;
      await User.findByIdAndUpdate(req.user._id, userUpdates);
    }

    const updatedProfile = await TechnicianProfile.findOne({ user: req.user._id }).populate(
      'user',
      'name email phone profilePhoto status'
    );

    res.status(200).json({
      success: true,
      message: 'Technician profile updated successfully.',
      data: updatedProfile,
    });
  } catch (error) {
    console.error('[UpdateProfile Error]:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error updating profile.',
    });
  }
};

// @desc    Quick update technician availability
// @route   PUT /api/technicians/availability
// @access  Private (Technician)
exports.updateAvailability = async (req, res) => {
  try {
    const { availability } = req.body;
    if (!['Available', 'On Project', 'Unavailable'].includes(availability)) {
      return res.status(400).json({
        success: false,
        message: 'Availability must be Available, On Project, or Unavailable.',
      });
    }

    const profile = await TechnicianProfile.findOneAndUpdate(
      { user: req.user._id },
      { currentAvailability: availability },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: `Availability updated to ${availability}.`,
      data: profile,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error updating availability.',
    });
  }
};

// @desc    Get technician skills
// @route   GET /api/technicians/:id/skills
// @access  Public / Protected
exports.getTechnicianSkills = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        message: 'Invalid technician ID format.',
      });
    }

    const profile = await TechnicianProfile.findOne({
      $or: [{ _id: id }, { user: id }],
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Technician profile not found.',
      });
    }

    res.status(200).json({
      success: true,
      data: profile.renewableSkills,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error retrieving technician skills.',
    });
  }
};

// @desc    Get Digital Skill Passport data for technician (Public & Verified)
// @route   GET /api/technicians/:id/passport OR GET /api/technicians/verify/:id
// @access  Public
exports.getDigitalSkillPassport = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || typeof id !== 'string') {
      return res.status(404).json({
        success: false,
        notFound: true,
        message: 'Skill Passport Not Found. The passport could not be verified. Please check the QR code and try again.',
      });
    }

    let profile = null;

    if (id === 'demo' || id === 'sample') {
      profile = await TechnicianProfile.findOne({}).populate('user', 'name email phone profilePhoto createdAt status');
    } else if (mongoose.Types.ObjectId.isValid(id)) {
      profile = await TechnicianProfile.findOne({
        $or: [{ _id: id }, { user: id }],
      }).populate('user', 'name email phone profilePhoto createdAt status');
    }

    // If not found by direct ObjectId, try finding by passportId suffix or RT-PASS format
    if (!profile) {
      const cleanId = id.trim().replace(/^RT-PASS-/i, '');
      const allProfiles = await TechnicianProfile.find({}).populate('user', 'name email phone profilePhoto createdAt status');
      
      profile = allProfiles.find((p) => {
        if (!p.user) return false;
        const uidStr = p.user._id ? p.user._id.toString() : '';
        const profIdStr = p._id ? p._id.toString() : '';
        const shortSuffix = uidStr.length >= 6 ? uidStr.substring(uidStr.length - 6).toUpperCase() : '';
        const passportCode = `RT-PASS-${shortSuffix}`;
        const searchUpper = cleanId.toUpperCase();
        const fullSearchUpper = id.trim().toUpperCase();

        return (
          passportCode === fullSearchUpper ||
          shortSuffix === searchUpper ||
          uidStr.toUpperCase().endsWith(searchUpper) ||
          profIdStr.toUpperCase().endsWith(searchUpper) ||
          uidStr.toLowerCase() === id.trim().toLowerCase() ||
          profIdStr.toLowerCase() === id.trim().toLowerCase()
        );
      });
    }

    if (!profile || !profile.user) {
      return res.status(404).json({
        success: false,
        notFound: true,
        message: 'Skill Passport Not Found. The passport could not be verified. Please check the QR code and try again.',
      });
    }

    // Verification status check
    const isUserActive = profile.user.status === 'active';
    if (!isUserActive) {
      return res.status(200).json({
        success: true,
        isVerified: false,
        verificationFailed: true,
        message: 'Passport Verification Failed. This skill passport is currently suspended or unverified.',
        data: {
          passportId: `RT-PASS-${profile.user._id.toString().substring(18).toUpperCase()}`,
          isVerified: false,
          technician: {
            name: profile.user.name,
            profession: profile.profession,
          },
        },
      });
    }

    const userId = profile.user._id;

    // Verified Certificates
    const verifiedCertificates = await Certificate.find({
      technician: userId,
      status: 'Verified',
    });

    // Assessment Results
    const assessmentResults = await AssessmentResult.find({
      technician: userId,
    }).sort('-completedAt');

    // Reviews & 5-factor ratings
    const reviews = await Review.find({ technician: userId })
      .populate('company', 'name')
      .populate('project', 'projectName location');

    // Detailed metrics calculation
    const factorAverages = {
      technicalSkill: 5.0,
      safety: 5.0,
      punctuality: 5.0,
      qualityOfWork: 5.0,
      overall: profile.averageRating || 5.0,
    };

    if (reviews.length > 0) {
      const count = reviews.length;
      factorAverages.technicalSkill = +(reviews.reduce((acc, r) => acc + (r.technicalSkill || 5), 0) / count).toFixed(1);
      factorAverages.safety = +(reviews.reduce((acc, r) => acc + (r.safety || 5), 0) / count).toFixed(1);
      factorAverages.punctuality = +(reviews.reduce((acc, r) => acc + (r.punctuality || 5), 0) / count).toFixed(1);
      factorAverages.qualityOfWork = +(reviews.reduce((acc, r) => acc + (r.qualityOfWork || 5), 0) / count).toFixed(1);
      factorAverages.overall = +(reviews.reduce((acc, r) => acc + (r.overallRating || 5), 0) / count).toFixed(1);
    }

    // Platform workforce deployments
    const platformAssignments = await WorkforceAssignment.find({
      technician: userId,
    }).populate('project', 'projectName projectType location budget companyName');

    const shortId = profile.user._id.toString().substring(18).toUpperCase();
    const passportId = `RT-PASS-${shortId}`;

    const techCity = profile.city ? profile.city.trim() : '';
    const techState = profile.state ? profile.state.trim() : '';
    const formattedLocation = techCity && techState ? `${techCity}, ${techState}` : (techCity || techState || '');

    // Combine completed projects: distinguish self-reported projects from verified platform assignments
    const completedProjectsList = [
      ...(profile.previousProjects || []).map((p) => ({
        projectName: p.title || p.projectName,
        projectType: p.projectType || 'Solar',
        role: p.role || 'Technician',
        capacity: p.capacity || '',
        location: p.location || formattedLocation,
        duration: p.durationMonths ? `${p.durationMonths} Months` : 'Completed',
        year: p.completionYear || '',
        verified: false,
        source: 'Added by technician',
      })),
      ...platformAssignments
        .filter((a) => a.assignmentStatus === 'Completed')
        .map((a) => ({
          projectName: a.project?.projectName || 'RenewTech Clean Energy Project',
          projectType: a.project?.projectType || 'Solar',
          role: a.roleAssigned || 'Technician',
          location: a.project?.location || '',
          duration: 'Completed',
          verified: true,
          source: 'RenewTech Platform Deployment',
        })),
    ];

    // Skills transparency: strictly separate verified skills from all skills
    const rawSkills = profile.renewableSkills || [];
    const allSkillsList = rawSkills.map((s) => ({
      name: s.name,
      category: s.category || 'Solar',
      proficiency: s.proficiency || 'Intermediate',
      isVerified: !!s.isVerified,
      verificationSource: s.verificationSource || (s.isVerified ? 'Assessment' : 'Added by technician'),
      verifiedAt: s.verifiedAt || null,
    }));
    const verifiedSkillsList = allSkillsList.filter((s) => s.isVerified);

    // Digital Passport Payload (Sanitized and Public-Safe: NO sensitive tokens or passwords)
    const passport = {
      passportId,
      isVerified: true,
      issuedDate: profile.user.createdAt,
      lastUpdated: profile.updatedAt || new Date().toISOString(),
      scanDate: new Date().toISOString(),
      verifiedBy: 'RenewTech Workforce',
      technician: {
        _id: profile.user._id,
        id: profile.user._id,
        name: profile.user.name,
        email: profile.user.email,
        phone: profile.user.phone,
        profilePhoto: profile.user.profilePhoto || null,
        profession: profile.profession || '',
        city: techCity,
        state: techState,
        experienceYears: profile.yearsOfExperience !== undefined ? profile.yearsOfExperience : 0,
        currentAvailability: profile.currentAvailability || 'Available',
      },
      scores: {
        overallSkillScore: profile.overallSkillScore || 0,
        categoryMastery: assessmentResults.length > 0 ? assessmentResults[0].categoryBreakdown : [],
        skillLevel: assessmentResults.length > 0 ? assessmentResults[0].skillLevel : (profile.overallSkillScore > 0 ? 'Assessed' : 'Not Assessed'),
      },
      verifiedSkills: verifiedSkillsList,
      allSkills: allSkillsList,
      skills: allSkillsList.map((s) => s.name),
      verifiedCertificatesCount: verifiedCertificates.length,
      verifiedCertificates: verifiedCertificates.map((c) => ({
        name: c.certificateName,
        issuingOrganization: c.issuingOrganization,
        certificateNumber: c.certificateNumber,
        issueDate: c.issueDate,
        expiryDate: c.expiryDate,
        status: 'Verified',
      })),
      completedProjects: completedProjectsList,
      assessmentsTaken: assessmentResults.map((a) => ({
        title: a.assessmentTitle,
        category: a.category,
        scorePercentage: a.scorePercentage,
        completedAt: a.completedAt,
        skillLevel: a.skillLevel,
      })),
      projectWorkforceSummary: {
        projectsCompleted: Math.max(profile.projectsCompleted || 0, completedProjectsList.length),
        activeProjectsCount: platformAssignments.filter((a) => a.assignmentStatus === 'Active').length,
        previousProjects: profile.previousProjects || [],
        platformDeployments: platformAssignments.map((a) => ({
          projectName: a.project?.projectName,
          projectType: a.project?.projectType,
          roleAssigned: a.roleAssigned,
          status: a.assignmentStatus,
          startDate: a.startDate,
          endDate: a.endDate,
        })),
      },
      ratingBreakdown: reviews.length > 0 ? factorAverages : {
        overall: profile.averageRating || null,
        technicalSkill: null,
        safety: null,
        punctuality: null,
        qualityOfWork: null,
      },
      reviewsCount: reviews.length,
      reviewsSample: reviews.slice(0, 3).map((r) => ({
        feedbackComment: r.feedbackComment,
        companyName: r.company?.name || 'Verified EPC Contractor',
        rating: r.overallRating,
      })),
      verificationSeal: 'RenewTech Verified Renewable Workforce Authority',
    };

    res.status(200).json({
      success: true,
      isVerified: true,
      data: passport,
    });
  } catch (error) {
    console.error('[SkillPassport Error]:', error);
    res.status(500).json({
      success: false,
      message: 'Server error generating Digital Skill Passport.',
    });
  }
};
