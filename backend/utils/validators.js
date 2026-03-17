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
    .optional({ checkFalsy: true })
    .isMobilePhone('any', { strictMode: false })
    .withMessage('Please provide a valid phone number'),
  body('alternateEmail')
    .optional({ checkFalsy: true })
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid alternate email'),

  // Projects validation
  body('projects.*.title')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Project title must not exceed 200 characters'),
  body('projects.*.description')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Project description must not exceed 1000 characters'),
  body('projects.*.technologies')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 500 })
    .withMessage('Technologies must not exceed 500 characters'),
  body('projects.*.githubLink')
    .optional({ checkFalsy: true })
    .custom((value) => {
      if (value && value.trim() !== '') {
        return /^https?:\/\/(www\.)?github\.com\/.+/.test(value);
      }
      return true;
    })
    .withMessage('GitHub link must start with https://github.com/'),
  body('projects.*.liveLink')
    .optional({ checkFalsy: true })
    .custom((value) => {
      if (value && value.trim() !== '') {
        return /^https?:\/\/.+/.test(value);
      }
      return true;
    })
    .withMessage('Live link must start with http:// or https://'),
  body('projects.*.bullets')
    .optional()
    .isArray({ max: 10 })
    .withMessage('Maximum 10 bullet points allowed per project'),
  body('projects.*.bullets.*')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Bullet point must not exceed 500 characters'),

  // Publications validation
  body('publications.*.title')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 1, max: 300 })
    .withMessage('Publication title must not exceed 300 characters'),
  body('publications.*.journal')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 200 })
    .withMessage('Journal name must not exceed 200 characters'),
  body('publications.*.year')
    .optional({ checkFalsy: true })
    .custom((value) => {
      if (value && value.trim() !== '') {
        return /^(19|20)\d{2}$/.test(value);
      }
      return true;
    })
    .withMessage('Year must be a valid 4-digit year (1900-2099)'),
  body('publications.*.paperLink')
    .optional({ checkFalsy: true })
    .custom((value) => {
      if (value && value.trim() !== '') {
        return /^https?:\/\/.+/.test(value);
      }
      return true;
    })
    .withMessage('Paper link must start with http:// or https://'),
  body('publications.*.description')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must not exceed 1000 characters'),

  // Certifications validation
  body('certifications.*.name')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Certification name must not exceed 200 characters'),
  body('certifications.*.issuer')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 200 })
    .withMessage('Issuer name must not exceed 200 characters'),
  body('certifications.*.certLink')
    .optional({ checkFalsy: true })
    .custom((value) => {
      if (value && value.trim() !== '') {
        return /^https?:\/\/.+/.test(value);
      }
      return true;
    })
    .withMessage('Certificate link must start with http:// or https://'),

  // Social Links validation
  body('socialLinks')
    .optional()
    .isArray({ max: 15 })
    .withMessage('Maximum 15 social links allowed'),
  body('socialLinks.*.title')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Social link title must not exceed 50 characters'),
  body('socialLinks.*.url')
    .optional({ checkFalsy: true })
    .custom((value) => {
      if (value && value.trim() !== '') {
        return /^https?:\/\/.+/.test(value);
      }
      return true;
    })
    .withMessage('URL must start with http:// or https://'),
  body('socialLinks.*.icon')
    .optional({ checkFalsy: true })
    .isString()
    .withMessage('Icon must be a string'),
  body('socialLinks.*.displayInHeader')
    .optional()
    .isBoolean()
    .withMessage('displayInHeader must be true or false'),

  // Internships validation
  body('internships.*.company')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Company name must not exceed 200 characters'),
  body('internships.*.role')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Role must not exceed 200 characters'),
  body('internships.*.description')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must not exceed 1000 characters'),
  body('internships.*.certLink')
    .optional({ checkFalsy: true })
    .custom((value) => {
      if (value && value.trim() !== '') {
        return /^https?:\/\/.+/.test(value);
      }
      return true;
    })
    .withMessage('Certificate link must start with http:// or https://'),
  body('internships.*.bullets')
    .optional()
    .isArray({ max: 10 })
    .withMessage('Maximum 10 bullet points allowed per internship'),
  body('internships.*.bullets.*')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Bullet point must not exceed 500 characters'),

  // Skills validation
  body('skills')
    .optional()
    .isArray({ max: 50 })
    .withMessage('Maximum 50 skills allowed'),
  body('skills.*')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Each skill must not exceed 100 characters'),

  // Achievements validation
  body('achievements')
    .optional()
    .isArray({ max: 20 })
    .withMessage('Maximum 20 achievements allowed'),
  body('achievements.*')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Each achievement must not exceed 500 characters'),
];

// Validation rules for resume version
const resumeVersionValidation = [
  body('name')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Resume name must be between 3 and 100 characters'),
  body('template')
    .isIn(['template1', 'template2'])
    .withMessage('Invalid template. Must be one of: template1, template2'),
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