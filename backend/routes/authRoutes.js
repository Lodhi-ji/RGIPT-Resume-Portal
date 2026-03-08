const express = require('express');
const { login, changePassword, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { loginValidation, changePasswordValidation, handleValidationErrors } = require('../utils/validators');

const router = express.Router();

// Public routes
router.post('/login', loginValidation, handleValidationErrors, login);

// Protected routes
router.post('/change-password', protect, changePasswordValidation, handleValidationErrors, changePassword);
router.get('/me', protect, getMe);

module.exports = router;