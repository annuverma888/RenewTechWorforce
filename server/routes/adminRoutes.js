const express = require('express');
const router = express.Router();
const {
  getAdminStatistics,
  getAdminAnalytics,
  getAdminTechnicians,
  getAdminCompanies,
  toggleUserStatus,
} = require('../controllers/adminController');
const {
  getAdminCertificates,
  verifyCertificate,
} = require('../controllers/certificateController');
const { protect, authorize } = require('../middleware/auth');

// All admin routes require admin role
router.use(protect, authorize('admin'));

router.get('/statistics', getAdminStatistics);
router.get('/analytics', getAdminAnalytics);
router.get('/technicians', getAdminTechnicians);
router.get('/companies', getAdminCompanies);
router.put('/users/:id/status', toggleUserStatus);

// Certificate verification
router.get('/certificates', getAdminCertificates);
router.put('/certificates/:id/verify', verifyCertificate);

module.exports = router;
