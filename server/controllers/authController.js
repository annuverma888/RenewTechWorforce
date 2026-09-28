const jwt = require('jsonwebtoken');
const User = require('../models/User');
const TechnicianProfile = require('../models/TechnicianProfile');
const CompanyProfile = require('../models/CompanyProfile');

// Helper to generate JWT token
const sendTokenResponse = (user, statusCode, res, extraData = {}) => {
  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET || 'renewtech_production_grade_jwt_secret_998822',
    { expiresIn: '30d' }
  );

  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      profilePhoto: user.profilePhoto,
      status: user.status,
    },
    ...extraData,
  });
};

// @desc    Register user (Technician, EPC Company, or Pending Role)
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, phone, password, confirmPassword, role, companyName, profession, city, state } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, email, and password.',
      });
    }

    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match. Please re-enter your password.',
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    const userRole = role && ['technician', 'epc_company', 'admin'].includes(role)
      ? role
      : 'pending_role';

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      phone: phone || '',
      password,
      role: userRole,
      authProvider: 'local',
      lastLogin: new Date(),
      profilePhoto: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=059669`,
    });

    let profile = null;

    if (userRole === 'technician') {
      profile = await TechnicianProfile.create({
        user: user._id,
        profession: profession || 'Certified Solar PV Wireman',
        city: city || 'Kanpur',
        state: state || 'Uttar Pradesh',
        renewableSkills: [
          { name: 'PV Installation', category: 'Solar', proficiency: 'Intermediate' },
          { name: 'Electrical Safety', category: 'Other', proficiency: 'Advanced' },
        ],
      });
      profile.calculateProfileCompletion();
      await profile.save();
    } else if (userRole === 'epc_company') {
      profile = await CompanyProfile.create({
        user: user._id,
        companyName: companyName || `${name} Renewable EPC`,
        city: city || 'Noida',
        state: state || 'Uttar Pradesh',
      });
    }

    sendTokenResponse(user, 201, res, {
      profile,
      needsRoleSelection: userRole === 'pending_role',
    });
  } catch (error) {
    console.error('[Register Error]:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error while registering user.',
    });
  }
};

// @desc    Authenticate with Firebase Google Sign-In
// @route   POST /api/auth/google
// @access  Public
exports.googleAuth = async (req, res) => {
  try {
    const { firebaseUid, email, name, profilePhoto, role } = req.body;

    if (!firebaseUid || !email) {
      return res.status(400).json({
        success: false,
        message: 'Firebase UID and email are required for Google authentication.',
      });
    }

    // Check if user exists by firebaseUid OR email
    let user = await User.findOne({
      $or: [{ firebaseUid }, { email: email.toLowerCase() }],
    });

    let isNewUser = false;

    if (user) {
      // Returning user
      user.firebaseUid = firebaseUid;
      user.authProvider = 'google';
      user.lastLogin = new Date();
      if (!user.profilePhoto && profilePhoto) {
        user.profilePhoto = profilePhoto;
      }
      if (name && (!user.name || user.name === 'User')) {
        user.name = name;
      }
      await user.save();
    } else {
      // New user
      isNewUser = true;
      const initialRole = role && ['technician', 'epc_company', 'admin'].includes(role)
        ? role
        : 'pending_role';

      user = await User.create({
        name: name || email.split('@')[0],
        email: email.toLowerCase(),
        firebaseUid,
        authProvider: 'google',
        role: initialRole,
        profilePhoto: profilePhoto || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name || email)}&backgroundColor=059669`,
        lastLogin: new Date(),
      });
    }

    // Check if user needs role selection
    const needsRoleSelection = user.role === 'pending_role';

    let profile = null;
    if (user.role === 'technician') {
      profile = await TechnicianProfile.findOne({ user: user._id });
      if (!profile) {
        profile = await TechnicianProfile.create({
          user: user._id,
          profession: 'Renewable Energy Technician',
          renewableSkills: [
            { name: 'PV Installation', category: 'Solar', proficiency: 'Intermediate' },
            { name: 'Electrical Safety', category: 'Other', proficiency: 'Advanced' },
          ],
        });
        profile.calculateProfileCompletion();
        await profile.save();
      }
    } else if (user.role === 'epc_company') {
      profile = await CompanyProfile.findOne({ user: user._id });
      if (!profile) {
        profile = await CompanyProfile.create({
          user: user._id,
          companyName: `${user.name} Renewable EPC`,
        });
      }
    }

    sendTokenResponse(user, isNewUser ? 201 : 200, res, {
      profile,
      needsRoleSelection,
      isNewUser,
    });
  } catch (error) {
    console.error('[GoogleAuth Error]:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during Google authentication.',
    });
  }
};

// @desc    Assign user role after initial signup / Google sign-in
// @route   POST /api/auth/select-role
// @access  Private
exports.selectRole = async (req, res) => {
  try {
    const { role } = req.body;
    const allowedRoles = ['technician', 'epc_company', 'admin'];

    if (!role || !allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be technician, epc_company, or admin.',
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    user.role = role;
    await user.save();

    let profile = null;
    if (role === 'technician') {
      profile = await TechnicianProfile.findOne({ user: user._id });
      if (!profile) {
        profile = await TechnicianProfile.create({
          user: user._id,
          profession: 'Certified Renewable Energy Technician',
          city: 'Kanpur',
          state: 'Uttar Pradesh',
          renewableSkills: [
            { name: 'PV Installation', category: 'Solar', proficiency: 'Intermediate' },
            { name: 'Electrical Safety', category: 'Other', proficiency: 'Advanced' },
          ],
        });
        profile.calculateProfileCompletion();
        await profile.save();
      }
    } else if (role === 'epc_company') {
      profile = await CompanyProfile.findOne({ user: user._id });
      if (!profile) {
        profile = await CompanyProfile.create({
          user: user._id,
          companyName: `${user.name} CleanTech Infrastructure`,
          city: 'Noida',
          state: 'Uttar Pradesh',
        });
      }
    }

    sendTokenResponse(user, 200, res, {
      profile,
      needsRoleSelection: false,
      message: `Role successfully updated to ${role}.`,
    });
  } catch (error) {
    console.error('[SelectRole Error]:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error updating role.',
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. User not found.',
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Password incorrect.',
      });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({
        success: false,
        message: 'Your account is suspended. Please contact support.',
      });
    }

    let profile = null;
    if (user.role === 'technician') {
      profile = await TechnicianProfile.findOne({ user: user._id });
    } else if (user.role === 'epc_company') {
      profile = await CompanyProfile.findOne({ user: user._id });
    }

    sendTokenResponse(user, 200, res, { profile });
  } catch (error) {
    console.error('[Login Error]:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while logging in.',
    });
  }
};

// @desc    Get current logged in user & role profile
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    let profile = null;

    if (user.role === 'technician') {
      profile = await TechnicianProfile.findOne({ user: user._id });
    } else if (user.role === 'epc_company') {
      profile = await CompanyProfile.findOne({ user: user._id });
    }

    res.status(200).json({
      success: true,
      user,
      profile,
    });
  } catch (error) {
    console.error('[GetMe Error]:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving current session.',
    });
  }
};

// @desc    Forgot Password (MVP simulator)
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this email address.',
      });
    }

    // In production, send email token. In MVP, verify user exists and return confirmation
    res.status(200).json({
      success: true,
      message: `Password reset instructions sent to ${email}. Check your inbox.`,
    });
  } catch (error) {
    console.error('[ForgotPassword Error]:', error);
    res.status(500).json({
      success: false,
      message: 'Server error processing password reset request.',
    });
  }
};
