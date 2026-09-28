const express = require('express');
const router = express.Router();
const { register, login, getMe, forgotPassword, googleAuth, selectRole } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleAuth);
router.post('/select-role', protect, selectRole);
router.get('/me', protect, getMe);
router.post('/forgot-password', forgotPassword);

module.exports = router;
