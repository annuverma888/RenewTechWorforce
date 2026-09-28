const express = require('express');
const router = express.Router();
const {
  matchTechniciansForProject,
  getRecommendedProjectsForTechnician,
} = require('../controllers/matchingController');
const { protect, authorize } = require('../middleware/auth');

router.get(
  '/project/:projectId',
  protect,
  authorize('epc_company', 'admin'),
  matchTechniciansForProject
);

router.get(
  '/technician/recommended',
  protect,
  authorize('technician'),
  getRecommendedProjectsForTechnician
);

module.exports = router;
