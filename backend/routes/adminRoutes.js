const express = require('express');
const { 
  uploadStudents, 
  getAllStudents, 
  getStats,
  getAllResumes,
  getStudentResumes,
  getResumePreview,
  downloadResumePDF,
  getStudentProfile,
  resetStudentPassword
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');
const { upload, handleUploadError } = require('../middleware/upload');

const router = express.Router();

// All routes are protected and admin only
router.use(protect);
router.use(adminOnly);

// Upload students from Excel
router.post(
  '/upload-students',
  upload.single('file'),
  handleUploadError,
  uploadStudents
);

// Get all students
router.get('/students', getAllStudents);

// Get statistics
router.get('/stats', getStats);

// Password management
router.post('/reset-student-password/:studentId', resetStudentPassword);

// Resume management routes
router.get('/resumes', getAllResumes);
router.get('/students/:studentId/resumes', getStudentResumes);
router.get('/students/:studentId/profile', getStudentProfile);
router.get('/resumes/:resumeId/preview', getResumePreview);
router.get('/resumes/:resumeId/download', downloadResumePDF);

module.exports = router;