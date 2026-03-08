const express = require('express');
const {
  getResumeVersions,
  getResumeVersion,
  createResumeVersion,
  updateResumeVersion,
  deleteResumeVersion,
  generateResumePreview,
  generateResumePDF
} = require('../controllers/resumeController');
const { protect, studentOnly } = require('../middleware/auth');
const { resumeVersionValidation, handleValidationErrors } = require('../utils/validators');

const router = express.Router();

// All routes are protected and student only
router.use(protect);
router.use(studentOnly);

// Resume version CRUD
router.get('/', getResumeVersions);
router.get('/:id', getResumeVersion);
router.post('/', resumeVersionValidation, handleValidationErrors, createResumeVersion);
router.put('/:id', resumeVersionValidation, handleValidationErrors, updateResumeVersion);
router.delete('/:id', deleteResumeVersion);

// Preview and PDF generation (preview must come before generate)
router.get('/:id/preview', generateResumePreview);
router.get('/:id/generate', generateResumePDF);

module.exports = router;