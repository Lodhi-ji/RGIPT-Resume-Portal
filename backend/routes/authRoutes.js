const express = require('express');
const { login, changePassword, getMe, activateAccount, forgotPassword } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { loginValidation, changePasswordValidation, handleValidationErrors } = require('../utils/validators');
const { passwordResetRateLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// Public routes
router.post('/login', loginValidation, handleValidationErrors, login);
router.post('/activate-account', passwordResetRateLimiter, activateAccount);
router.post('/forgot-password', passwordResetRateLimiter, forgotPassword);

// Protected routes
router.post('/change-password', protect, changePasswordValidation, handleValidationErrors, changePassword);
router.get('/me', protect, getMe);

module.exports = router;