const express = require('express');
const router = express.Router();
const {
  getAssessments,
  getAssessmentById,
  submitAssessment,
  getMyAssessmentResults,
} = require('../controllers/assessmentController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', getAssessments);
router.get('/my-results', protect, authorize('technician'), getMyAssessmentResults);
router.get('/:id', protect, getAssessmentById);
router.post('/submit', protect, authorize('technician'), submitAssessment);

module.exports = router;
