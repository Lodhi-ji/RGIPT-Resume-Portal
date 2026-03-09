const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Student = require('../models/Student');
const { generateRandomPassword, hashPassword } = require('../utils/helpers');
const emailService = require('../services/emailService');
const auditLogger = require('../utils/auditLogger');

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate email and password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Please provide email and password',
          code: 'MISSING_CREDENTIALS'
        }
      });
    }

    // Check for user
    const student = await Student.findOne({ instituteEmail: email.toLowerCase() });

    if (!student) {
      // Log failed login attempt
      await auditLogger.logFailedLogin(email);
      
      return res.status(401).json({
        success: false,
        error: {
          message: 'Invalid credentials',
          code: 'INVALID_CREDENTIALS'
        }
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, student.password);

    if (!isMatch) {
      // Log failed login attempt
      await auditLogger.logFailedLogin(email);
      
      return res.status(401).json({
        success: false,
        error: {
          message: 'Invalid credentials',
          code: 'INVALID_CREDENTIALS'
        }
      });
    }

    // Generate token
    const token = generateToken(student._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: student._id,
        name: student.name,
        email: student.instituteEmail,
        role: student.role,
        isFirstLogin: student.isFirstLogin,
        passwordSet: student.passwordSet
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Server error',
        code: 'SERVER_ERROR'
      }
    });
  }
};

// @desc    Change password
// @route   POST /api/auth/change-password
// @access  Private
const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    console.log('=== Change Password Request ===');
    console.log('User ID:', req.user?.id);
    console.log('Old password provided:', !!oldPassword);
    console.log('New password provided:', !!newPassword);

    // Validate input
    if (!oldPassword || !newPassword) {
      console.log('ERROR: Missing passwords');
      return res.status(400).json({
        success: false,
        error: {
          message: 'Please provide old password and new password',
          code: 'MISSING_PASSWORDS'
        }
      });
    }

    // Password strength validation
    if (newPassword.length < 8) {
      console.log('ERROR: Password too short');
      return res.status(400).json({
        success: false,
        error: {
          message: 'Password must be at least 8 characters long',
          code: 'WEAK_PASSWORD'
        }
      });
    }

    // Password complexity validation
    const hasUpperCase = /[A-Z]/.test(newPassword);
    const hasLowerCase = /[a-z]/.test(newPassword);
    const hasNumber = /\d/.test(newPassword);

    if (!hasUpperCase || !hasLowerCase || !hasNumber) {
      console.log('ERROR: Password does not meet complexity requirements');
      return res.status(400).json({
        success: false,
        error: {
          message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
          code: 'WEAK_PASSWORD'
        }
      });
    }

    // Get current user
    const student = await Student.findById(req.user.id);
    
    console.log('Student found:', !!student);
    console.log('Student has password:', !!student?.password);
    console.log('Student passwordSet:', student?.passwordSet);

    if (!student) {
      console.log('ERROR: Student not found');
      return res.status(404).json({
        success: false,
        error: {
          message: 'User not found',
          code: 'USER_NOT_FOUND'
        }
      });
    }

    if (!student.password) {
      console.log('ERROR: Student password is null');
      return res.status(400).json({
        success: false,
        error: {
          message: 'Account not properly activated. Please contact support.',
          code: 'NO_PASSWORD_SET'
        }
      });
    }

    // Check old password
    console.log('Comparing passwords...');
    const isMatch = await bcrypt.compare(oldPassword, student.password);
    console.log('Password match:', isMatch);

    if (!isMatch) {
      console.log('ERROR: Password mismatch');
      return res.status(400).json({
        success: false,
        error: {
          message: 'Current password is incorrect',
          code: 'INCORRECT_OLD_PASSWORD'
        }
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password and first login flag
    await Student.findByIdAndUpdate(req.user.id, {
      password: hashedPassword,
      isFirstLogin: false
    });

    // Log password change
    await auditLogger.logPasswordChange(req.user.id);

    console.log('Password changed successfully');
    res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Server error',
        code: 'SERVER_ERROR'
      }
    });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const student = await Student.findById(req.user.id).select('-password');
    
    res.status(200).json({
      success: true,
      user: {
        id: student._id,
        name: student.name,
        email: student.instituteEmail,
        role: student.role,
        isFirstLogin: student.isFirstLogin
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Server error',
        code: 'SERVER_ERROR'
      }
    });
  }
};

// @desc    Activate student account via email
// @route   POST /api/auth/activate-account
// @access  Public
const activateAccount = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Please provide an email address',
          code: 'MISSING_EMAIL'
        }
      });
    }

    // Find student by email
    const student = await Student.findOne({ 
      instituteEmail: email.toLowerCase() 
    });

    // Check if profile exists
    if (!student) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'No user found. Please contact administration.',
          code: 'PROFILE_NOT_FOUND'
        }
      });
    }

    // Check if already activated
    if (student.passwordSet) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Account already activated. Use \'Forgot Password\' if needed.',
          code: 'ALREADY_ACTIVATED'
        }
      });
    }

    // Generate new password
    const newPassword = generateRandomPassword();
    const hashedPassword = await hashPassword(newPassword);

    // Update password and set passwordSet flag
    await Student.findByIdAndUpdate(student._id, {
      password: hashedPassword,
      passwordSet: true,
      isFirstLogin: true
    });

    // Send activation email with new password
    const emailResult = await emailService.sendActivationEmail({
      studentName: student.name,
      email: student.instituteEmail,
      password: newPassword,
      loginUrl: process.env.PORTAL_URL
    });

    // Log the activation
    await auditLogger.logAccountActivation(student._id, email);

    if (!emailResult.success) {
      return res.status(500).json({
        success: false,
        error: {
          message: 'Account activated but email delivery failed. Please contact support.',
          code: 'EMAIL_DELIVERY_FAILED'
        }
      });
    }

    res.status(200).json({
      success: true,
      message: 'Account activated successfully! Check your email for login credentials.'
    });
  } catch (error) {
    console.error('Account activation error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Server error',
        code: 'SERVER_ERROR'
      }
    });
  }
};

// @desc    Request password reset via email (for activated accounts)
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Please provide an email address',
          code: 'MISSING_EMAIL'
        }
      });
    }

    // Find student by email
    const student = await Student.findOne({ 
      instituteEmail: email.toLowerCase() 
    });

    // Always return success to prevent email enumeration
    const genericMessage = 'If the email exists in our system, a password reset link has been sent.';

    if (!student) {
      // Log failed attempt
      await auditLogger.logPasswordResetRequest(email, false, 'Email not found');
      
      return res.status(200).json({
        success: true,
        message: genericMessage
      });
    }

    // Check if account is activated
    if (!student.passwordSet) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Account not activated. Please use \'Sign Up\' first.',
          code: 'NOT_ACTIVATED'
        }
      });
    }

    // Generate new password
    const newPassword = generateRandomPassword();
    const hashedPassword = await hashPassword(newPassword);

    // Update password in database
    await Student.findByIdAndUpdate(student._id, {
      password: hashedPassword
    });

    // Send email with new password
    const emailResult = await emailService.sendPasswordResetEmail({
      studentName: student.name,
      email: student.instituteEmail,
      password: newPassword,
      loginUrl: process.env.PORTAL_URL
    });

    // Log the reset
    await auditLogger.logPasswordResetRequest(
      email, 
      emailResult.success,
      emailResult.success ? null : emailResult.error
    );

    res.status(200).json({
      success: true,
      message: genericMessage
    });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Server error',
        code: 'SERVER_ERROR'
      }
    });
  }
};

module.exports = {
  login,
  changePassword,
  getMe,
  activateAccount,
  forgotPassword
};