const express = require('express');
const router = express.Router();
const { submitReview, getTechnicianReviews } = require('../controllers/reviewController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, authorize('epc_company', 'admin'), submitReview);
router.get('/:technicianId', getTechnicianReviews);

module.exports = router;
