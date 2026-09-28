const express = require('express');
const router = express.Router();
const {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
} = require('../controllers/projectController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, authorize('epc_company', 'admin'), createProject);
router.get('/', getProjects);
router.get('/:id', getProjectById);
router.put('/:id', protect, authorize('epc_company', 'admin'), updateProject);
router.delete('/:id', protect, authorize('epc_company', 'admin'), deleteProject);

module.exports = router;
