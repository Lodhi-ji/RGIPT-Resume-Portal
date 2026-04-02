const express = require('express');
const { login, changePassword, getMe, sendOtp, verifyOtpSetPassword } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { loginValidation, changePasswordValidation, handleValidationErrors } = require('../utils/validators');
const { otpRateLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// Public routes
router.post('/login', loginValidation, handleValidationErrors, login);
router.post('/send-otp', otpRateLimiter, sendOtp);
router.post('/verify-otp-set-password', verifyOtpSetPassword);

// Protected routes
router.post('/change-password', protect, changePasswordValidation, handleValidationErrors, changePassword);
router.get('/me', protect, getMe);

module.exports = router;