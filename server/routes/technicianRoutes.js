const express = require('express');
const router = express.Router();
const {
  getTechnicians,
  getTechnicianById,
  updateProfile,
  updateAvailability,
  getTechnicianSkills,
  getDigitalSkillPassport,
} = require('../controllers/technicianController');
const {
  uploadCertificate,
  getMyCertificates,
} = require('../controllers/certificateController');
const { protect, authorize } = require('../middleware/auth');

// Public or general technician directory
router.get('/', getTechnicians);

// Technician private operations
router.put('/profile', protect, authorize('technician'), updateProfile);
router.put('/availability', protect, authorize('technician'), updateAvailability);
router.get('/my-certificates', protect, authorize('technician'), getMyCertificates);
router.post('/certificates', protect, authorize('technician'), uploadCertificate);

// Individual technician resources (must be after specific string routes)
router.get('/:id', getTechnicianById);
router.get('/:id/skills', getTechnicianSkills);
router.get('/:id/passport', getDigitalSkillPassport);

module.exports = router;
