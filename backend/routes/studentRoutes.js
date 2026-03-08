const express = require('express');
const {
  getMe,
  getProfile,
  updateProfile,
  addProject,
  addInternship,
  deleteProject,
  deleteInternship
} = require('../controllers/studentController');
const { protect, studentOnly } = require('../middleware/auth');
const { profileValidation, handleValidationErrors } = require('../utils/validators');

const router = express.Router();

// All routes are protected and student only
router.use(protect);
router.use(studentOnly);

// Get student data
router.get('/me', getMe);

// Profile routes
router.get('/profile', getProfile);
router.put('/profile', profileValidation, handleValidationErrors, updateProfile);

// Project routes
router.post('/profile/projects', addProject);
router.delete('/profile/projects/:projectId', deleteProject);

// Internship routes
router.post('/profile/internships', addInternship);
router.delete('/profile/internships/:internshipId', deleteInternship);

module.exports = router;