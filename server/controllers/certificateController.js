const Certificate = require('../models/Certificate');
const TechnicianProfile = require('../models/TechnicianProfile');
const Notification = require('../models/Notification');

// @desc    Upload new certificate
// @route   POST /api/technicians/certificates
// @access  Private (Technician)
exports.uploadCertificate = async (req, res) => {
  try {
    const {
      certificateName,
      issuingOrganization,
      certificateNumber,
      issueDate,
      expiryDate,
      category,
      documentUrl,
    } = req.body;

    if (!certificateName || !issuingOrganization || !certificateNumber || !issueDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide certificate name, issuing organization, certificate number, and issue date.',
      });
    }

    // Check if certificate number already exists
    const existing = await Certificate.findOne({ certificateNumber: certificateNumber.trim() });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'A certificate with this registration number has already been uploaded.',
      });
    }

    const cert = await Certificate.create({
      technician: req.user._id,
      certificateName,
      issuingOrganization,
      certificateNumber: certificateNumber.trim(),
      issueDate,
      expiryDate: expiryDate || null,
      category: category || 'Solar',
      documentUrl: documentUrl || 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80',
      status: 'Pending',
    });

    // Notify technician that certificate was submitted for admin review
    await Notification.create({
      recipient: req.user._id,
      title: 'Certificate Submitted',
      message: `Your certificate "${certificateName}" has been submitted for verification.`,
      type: 'certificate',
      link: '/technician/certificates',
    });

    res.status(201).json({
      success: true,
      message: 'Certificate uploaded successfully and queued for admin verification.',
      data: cert,
    });
  } catch (error) {
    console.error('[UploadCertificate Error]:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error uploading certificate.',
    });
  }
};

// @desc    Get current technician's certificates
// @route   GET /api/technicians/my-certificates
// @access  Private (Technician)
exports.getMyCertificates = async (req, res) => {
  try {
    const certs = await Certificate.find({ technician: req.user._id }).sort('-createdAt');
    res.status(200).json({
      success: true,
      count: certs.length,
      data: certs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error retrieving certificates.',
    });
  }
};

// @desc    Admin: Get all certificates with filter (Pending, Verified, Rejected)
// @route   GET /api/admin/certificates
// @access  Private (Admin)
exports.getAdminCertificates = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const certs = await Certificate.find(filter)
      .populate('technician', 'name email phone profilePhoto')
      .populate('verifiedBy', 'name email')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: certs.length,
      data: certs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error retrieving admin certificates.',
    });
  }
};

// @desc    Admin: Verify or Reject certificate
// @route   PUT /api/admin/certificates/:id/verify
// @access  Private (Admin)
exports.verifyCertificate = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rejectionReason, adminNotes } = req.body;

    if (!['Verified', 'Rejected', 'Pending'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be Verified, Rejected, or Pending.',
      });
    }

    const cert = await Certificate.findById(id).populate('technician', 'name email');
    if (!cert) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found.',
      });
    }

    cert.status = status;
    cert.verifiedBy = req.user._id;
    cert.verifiedAt = status === 'Verified' ? new Date() : null;
    if (rejectionReason) cert.rejectionReason = rejectionReason;
    if (adminNotes) cert.adminNotes = adminNotes;

    await cert.save();

    // Update technician profile verified certificate count
    const verifiedCount = await Certificate.countDocuments({
      technician: cert.technician._id,
      status: 'Verified',
    });

    const techProfile = await TechnicianProfile.findOne({ user: cert.technician._id });
    if (techProfile) {
      techProfile.verifiedCertificatesCount = verifiedCount;
      techProfile.calculateProfileCompletion();
      await techProfile.save();
    }

    // Send in-app notification
    if (status === 'Verified') {
      await Notification.create({
        recipient: cert.technician._id,
        title: 'Certificate Verified ✓',
        message: `Your certificate "${cert.certificateName}" has been successfully verified! It now carries the official ✓ Verified badge on your profile and Skill Passport.`,
        type: 'certificate',
        link: '/technician/certificates',
      });
    } else if (status === 'Rejected') {
      await Notification.create({
        recipient: cert.technician._id,
        title: 'Certificate Update Required',
        message: `Your certificate "${cert.certificateName}" could not be verified. Reason: ${rejectionReason || 'Please provide higher resolution credential proof.'}`,
        type: 'certificate',
        link: '/technician/certificates',
      });
    }

    res.status(200).json({
      success: true,
      message: `Certificate has been marked as ${status}.`,
      data: cert,
    });
  } catch (error) {
    console.error('[VerifyCertificate Error]:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating certificate verification status.',
    });
  }
};
