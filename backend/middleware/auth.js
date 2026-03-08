const jwt = require('jsonwebtoken');
const Student = require('../models/Student');

// Protect routes - verify JWT token
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token
      req.user = await Student.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: {
            message: 'Not authorized, user not found',
            code: 'USER_NOT_FOUND'
          }
        });
      }

      next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({
        success: false,
        error: {
          message: 'Not authorized, token failed',
          code: 'TOKEN_INVALID'
        }
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      error: {
        message: 'Not authorized, no token',
        code: 'NO_TOKEN'
      }
    });
  }
};

// Admin only middleware
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({
      success: false,
      error: {
        message: 'Access denied. Admin role required.',
        code: 'ADMIN_REQUIRED'
      }
    });
  }
};

// Student only middleware
const studentOnly = (req, res, next) => {
  if (req.user && req.user.role === 'student') {
    next();
  } else {
    res.status(403).json({
      success: false,
      error: {
        message: 'Access denied. Student role required.',
        code: 'STUDENT_REQUIRED'
      }
    });
  }
};

module.exports = { protect, adminOnly, studentOnly };