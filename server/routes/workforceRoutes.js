const express = require('express');
const router = express.Router();
const {
  getCompanyWorkforce,
  assignToWorkforce,
  getProjectWorkforce,
  updateWorkforceAssignment,
  updateProjectProgress,
} = require('../controllers/workforceController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, getCompanyWorkforce);
router.post('/', protect, authorize('epc_company', 'admin'), assignToWorkforce);
router.get('/project/:projectId', protect, getProjectWorkforce);
router.put('/:id', protect, authorize('epc_company', 'admin'), updateWorkforceAssignment);
router.put('/project/:projectId/progress', protect, authorize('epc_company', 'admin'), updateProjectProgress);

module.exports = router;
