const { body, validationResult } = require('express-validator');

// Validation rules for login
const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// Validation rules for password change
const changePasswordValidation = [
  body('oldPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number')
];

// Validation rules for profile update
const profileValidation = [
  body('phone')
    .optional()
    .isMobilePhone('any', { strictMode: false })
    .withMessage('Please provide a valid phone number'),
  body('alternateEmail')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid alternate email'),
  
  // Projects validation
  body('projects.*.title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Project title must be between 3 and 200 characters'),
  body('projects.*.description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Project description must not exceed 1000 characters'),
  body('projects.*.technologies')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Technologies must not exceed 500 characters'),
  body('projects.*.githubLink')
    .optional()
    .custom((value) => {
      if (value && value.trim() !== '') {
        return /^https?:\/\/(www\.)?github\.com\/.+/.test(value);
      }
      return true;
    })
    .withMessage('Please provide a valid GitHub URL (https://github.com/...)'),
  body('projects.*.liveLink')
    .optional()
    .custom((value) => {
      if (value && value.trim() !== '') {
        return /^https?:\/\/.+/.test(value);
      }
      return true;
    })
    .withMessage('Please provide a valid URL starting with http:// or https://'),
  body('projects.*.bullets')
    .optional()
    .isArray({ max: 10 })
    .withMessage('Maximum 10 bullet points allowed per project'),
  body('projects.*.bullets.*')
    .optional()
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Each bullet point must be between 10 and 500 characters'),
  
  // Publications validation
  body('publications.*.title')
    .optional()
    .trim()
    .isLength({ min: 5, max: 300 })
    .withMessage('Publication title must be between 5 and 300 characters'),
  body('publications.*.journal')
    .optional()
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Journal/Conference name must be between 3 and 200 characters'),
  body('publications.*.year')
    .optional()
    .matches(/^(19|20)\d{2}$/)
    .withMessage('Year must be a valid 4-digit year (1900-2099)'),
  body('publications.*.paperLink')
    .optional()
    .custom((value) => {
      if (value && value.trim() !== '') {
        return /^https?:\/\/.+/.test(value);
      }
      return true;
    })
    .withMessage('Please provide a valid paper URL starting with http:// or https://'),
  body('publications.*.description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Publication description must not exceed 1000 characters'),
  
  // Certifications validation
  body('certifications.*.name')
    .optional()
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Certification name must be between 3 and 200 characters'),
  body('certifications.*.issuer')
    .optional()
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Issuer name must be between 2 and 200 characters'),
  body('certifications.*.certLink')
    .optional()
    .custom((value) => {
      if (value && value.trim() !== '') {
        return /^https?:\/\/.+/.test(value);
      }
      return true;
    })
    .withMessage('Please provide a valid certificate URL starting with http:// or https://'),
  
  // Social Links validation (array format)
  body('socialLinks')
    .optional()
    .isArray({ max: 15 })
    .withMessage('Maximum 15 social links allowed'),
  body('socialLinks.*.title')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Social link title must be between 2 and 50 characters'),
  body('socialLinks.*.url')
    .optional()
    .isURL({ protocols: ['http', 'https'], require_protocol: true })
    .withMessage('Please provide a valid URL starting with http:// or https://'),
  body('socialLinks.*.icon')
    .optional()
    .isIn(['github', 'linkedin', 'leetcode', 'codeforces', 'portfolio', 'website', 'twitter', 'medium', 'youtube', 'instagram', 'facebook', 'default'])
    .withMessage('Invalid icon name. Must be one of: github, linkedin, leetcode, codeforces, portfolio, website, twitter, medium, youtube, instagram, facebook, default'),
  body('socialLinks.*.displayInHeader')
    .optional()
    .isBoolean()
    .withMessage('displayInHeader must be true or false'),
  
  // Internships validation
  body('internships.*.company')
    .optional()
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Company name must be between 2 and 200 characters'),
  body('internships.*.role')
    .optional()
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Role must be between 2 and 200 characters'),
  body('internships.*.description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Internship description must not exceed 1000 characters'),
  
  // Skills validation
  body('skills')
    .optional()
    .isArray({ max: 50 })
    .withMessage('Maximum 50 skills allowed'),
  body('skills.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Each skill must be between 1 and 100 characters'),
  
  // Achievements validation
  body('achievements')
    .optional()
    .isArray({ max: 20 })
    .withMessage('Maximum 20 achievements allowed'),
  body('achievements.*')
    .optional()
    .trim()
    .isLength({ min: 5, max: 500 })
    .withMessage('Each achievement must be between 5 and 500 characters')
];

// Validation rules for resume version
const resumeVersionValidation = [
  body('name')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Resume name must be between 3 and 100 characters'),
  body('template')
    .isIn(['template1', 'template2', 'template3', 'template4'])
    .withMessage('Invalid template. Must be one of: template1, template2, template3, template4'),
  body('sectionsEnabled')
    .optional()
    .isObject()
    .withMessage('sectionsEnabled must be an object'),
  body('selectedProjects')
    .optional()
    .isArray()
    .withMessage('selectedProjects must be an array'),
  body('selectedInternships')
    .optional()
    .isArray()
    .withMessage('selectedInternships must be an array'),
  body('selectedPublications')
    .optional()
    .isArray()
    .withMessage('selectedPublications must be an array'),
  body('selectedCertifications')
    .optional()
    .isArray()
    .withMessage('selectedCertifications must be an array'),
  body('selectedSocialLinks')
    .optional()
    .isArray()
    .withMessage('selectedSocialLinks must be an array')
];

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: errors.array()
      }
    });
  }
  next();
};

module.exports = {
  loginValidation,
  changePasswordValidation,
  profileValidation,
  resumeVersionValidation,
  handleValidationErrors
};