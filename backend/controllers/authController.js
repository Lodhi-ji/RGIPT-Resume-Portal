const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Student = require('../models/Student');
const Otp = require('../models/Otp');
const { generateOtp, storeOtp } = require('../utils/helpers');
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
          message: 'Wrong password. Please try again.',
          code: 'WRONG_PASSWORD'
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

    // Update password and mark account as activated if flag was out of sync
    await Student.findByIdAndUpdate(req.user.id, {
      password: hashedPassword,
      passwordSet: true
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
        role: student.role
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

// @desc    Send OTP for account activation or password reset
// @route   POST /api/auth/send-otp
// @access  Public
const sendOtp = async (req, res) => {
  try {
    const { email, purpose } = req.body;

    // Validate required fields
    if (!email || !purpose) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Please provide email and purpose',
          code: 'MISSING_FIELDS'
        }
      });
    }

    // Validate purpose
    const validPurposes = ['activation', 'password_reset'];
    if (!validPurposes.includes(purpose)) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid purpose. Must be one of: activation, password_reset',
          code: 'INVALID_PURPOSE'
        }
      });
    }

    // Look up student
    const student = await Student.findOne({ instituteEmail: email.toLowerCase() });

    if (!student) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'No account found with this email address. Please contact administration.',
          code: 'USER_NOT_FOUND'
        }
      });
    }

    // Purpose-specific checks
    if (purpose === 'activation' && student.passwordSet === true) {
      return res.status(400).json({
        success: false,
        error: {
          message: "Account already activated. Use 'Forgot Password' to reset your password.",
          code: 'ALREADY_ACTIVATED'
        }
      });
    }

    if (purpose === 'password_reset' && !student.password) {
      return res.status(400).json({
        success: false,
        error: {
          message: "Account not yet activated. Please use 'Sign Up / Activate Account' first.",
          code: 'NOT_ACTIVATED'
        }
      });
    }

    // Generate and store OTP
    const otp = generateOtp();
    await storeOtp(email.toLowerCase(), otp, purpose);

    // Send OTP email
    const emailResult = await emailService.sendOtpEmail({
      studentName: student.name,
      email: student.instituteEmail,
      otp,
      purpose
    });

    if (!emailResult.success) {
      return res.status(500).json({
        success: false,
        error: {
          message: 'Failed to send OTP email. Please try again later.',
          code: 'EMAIL_DELIVERY_FAILED'
        }
      });
    }

    res.status(200).json({
      success: true,
      message: 'OTP sent to your email address. It expires in 10 minutes.'
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Server error',
        code: 'SERVER_ERROR'
      }
    });
  }
};

// @desc    Verify OTP and set new password (activation or password reset)
// @route   POST /api/auth/verify-otp-set-password
// @access  Public
const verifyOtpSetPassword = async (req, res) => {
  try {
    const { email, otp, password, purpose } = req.body;

    // Validate required fields
    if (!email || !otp || !password || !purpose) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Please provide email, otp, password, and purpose',
          code: 'MISSING_FIELDS'
        }
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Password must be at least 6 characters long.',
          code: 'WEAK_PASSWORD'
        }
      });
    }

    // Find OTP document
    const otpDoc = await Otp.findOne({ email: email.toLowerCase(), purpose });

    if (!otpDoc) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'OTP has expired or is invalid. Please request a new one.',
          code: 'OTP_EXPIRED_OR_INVALID'
        }
      });
    }

    // Verify OTP
    const isOtpValid = await bcrypt.compare(otp, otpDoc.otpHash);

    if (!isOtpValid) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Incorrect OTP. Please try again.',
          code: 'OTP_INVALID'
        }
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Update student record
    await Student.findOneAndUpdate(
      { instituteEmail: email.toLowerCase() },
      { password: hashedPassword, passwordSet: true }
    );

    // Delete OTP doc
    await Otp.deleteOne({ email: email.toLowerCase(), purpose });

    // Return purpose-specific success message
    const message = purpose === 'activation'
      ? 'Account activated successfully. You can now log in.'
      : 'Password reset successfully. You can now log in.';

    res.status(200).json({
      success: true,
      message
    });
  } catch (error) {
    console.error('Verify OTP set password error:', error);
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
  sendOtp,
  verifyOtpSetPassword
};