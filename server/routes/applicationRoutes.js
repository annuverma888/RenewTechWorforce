const express = require('express');
const router = express.Router();
const {
  applyToProject,
  getApplications,
  getApplicationById,
  updateApplicationStatus,
  withdrawApplication,
} = require('../controllers/applicationController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, authorize('technician'), applyToProject);
router.get('/', protect, getApplications);
router.get('/:id', protect, getApplicationById);
router.put('/:id/status', protect, authorize('epc_company', 'admin'), updateApplicationStatus);
router.delete('/:id', protect, authorize('technician'), withdrawApplication);

module.exports = router;

